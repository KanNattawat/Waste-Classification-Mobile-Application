import { prisma } from "../prisma/prisma.js";



export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { User_ID: req.user.userId },
            select: {
                User_ID: true,
                Full_name: true,
                User_name: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
};


export const uploadtoStorage = async (req, res) => {
    try {
        const { user_id, wastetype, image_path, probs } = req.body
        //image_path อาจจะไม่ต้องใช้แล้วเพราะใช้แค่ user_id กับ img_id ก็พอในการดึงรูปจาก firebase
        const wasteMap = {
            "ขยะย่อยสลาย": 1,
            "ขยะอันตราย": 2,
            "ขยะทั่วไป": 3,
            "ขยะรีไซเคิล": 4
        };
        const wasteid = wasteMap[wastetype];
        console.log("probs:", probs)

        const img = await prisma.waste.create({
            data: {
                User_ID: parseInt(user_id),
                WasteType_ID: wasteid,
                Image_path: image_path,
                Probs: probs,
                Vote_wastetype: [0, 0, 0, 0]
            }
        })
        res.json({ imgid: img.Waste_ID })
    } catch (error) {
        console.log(error);
    }
}

export const getHistory = async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log(userId)
        const waste = await prisma.waste.findMany({
            where: { User_ID: Number(userId) }
        })

        console.log(waste)

        res.status(200).json({
            msg: "getHistory Successful",
            waste: waste
        })
    } catch (error) {
        console.log(error);
    }
}

export const getHistoryData = async (req, res) => {
    try {
        // const userId = req.query.userId;
        const waste = req.query.wasteId;
        const userid = req.query.userId;
        if (!waste) {
            return res.status(400).json({ error: "Null imageId" });
        }
        console.log(waste)
        const [wasteData, isVote] = await Promise.all([
            prisma.waste.findFirst({
                where: { Waste_ID: Number(waste) },
            }),
            prisma.waste.findFirst({
                where: { Waste_ID: Number(waste) },
            })
        ])



        if (!wasteData) {
            return res.status(404).json({ error: "ไม่พบข้อมูล" });
        }

        res.status(200).json({ item: wasteData, isVoted: isVote ? true : false });
    } catch (error) {
        console.error("getHistoryData error:", error);
        res.status(500).json({ error: "server error" });
    }
};



export const getWeekly = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ msg: "userId is required" });
        }

        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        const count = await prisma.waste.count({
            where: {
                User_ID: Number(userId),
                Timestamp: {
                    gte: oneWeekAgo,
                    lte: now
                }
            }
        });

        const img = await prisma.waste.findMany({
            where: {
                User_ID: Number(userId),
                Timestamp: {
                    gte: oneWeekAgo,
                    lte: now
                }
            }
        });

        res.status(200).json({
            msg: "getHistory Successful",
            totalLastWeek: count,
            img: img
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error", error: String(error) });
    }
}

export const getStats = async (req, res) => {
    try {
        const userId = req.user.userId; // ได้จาก JWT middleware

        // ดึงข้อมูลจำนวนขยะแต่ละประเภท
        const hazardCount = await prisma.waste.count({
            where: { User_ID: Number(userId), WasteType_ID: 2 } // ขยะอันตราย
        });

        const biodegradableCount = await prisma.waste.count({
            where: { User_ID: Number(userId), WasteType_ID: 1 } // ขยะย่อยสลาย
        });

        const generalCount = await prisma.waste.count({
            where: { User_ID: Number(userId), WasteType_ID: 4 } // ขยะทั่วไป
        });

        const recyclableCount = await prisma.waste.count({
            where: { User_ID: Number(userId), WasteType_ID: 3 } // ขยะรีไซเคิล
        });

        const total = hazardCount + biodegradableCount + generalCount + recyclableCount;

        res.status(200).json({
            total: total,
            hazard: hazardCount,
            biodegradable: biodegradableCount,
            general: generalCount,
            recyclable: recyclableCount
        });
    } catch (error) {
        console.error("getStats error:", error);
        res.status(500).json({ error: "Server error" });
    }
};


const getStreak = async (userId) => {

    const history = await prisma.waste.findMany({
        where: { User_ID: Number(userId) },
        select: { Timestamp: true },
        orderBy: { Timestamp: 'desc' },
    });

    if (history.length === 0) return 0;

    const dates = [...new Set(history.map(h =>
        new Date(h.Timestamp).toISOString().split('T')[0]
    ))];


    let streak = 0;
    let currentDate = new Date();


    const todayStr = currentDate.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
        return 0;
    }



    for (let i = 0; i < dates.length; i++) {
        const d = new Date(dates[i]);


        if (i > 0) {
            const prevDate = new Date(dates[i - 1]);
            const diffTime = Math.abs(prevDate - d);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        } else {
            streak = 1;
        }
    }

    return streak;
};


//แยกขยะติดต่อกัน, สัปดาห์นี้แยกไป, สถิติการคัดแยกทั้งหมด, ชื่อ point
export const getHome = async (req, res) => {
    try {
        const userId = req.query.userId

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const [userData, wasteData, weekData] = await Promise.all([
            prisma.user.findUnique(
                { where: { User_ID: Number(userId) }, select: { User_name: true, Points: true } }),
            prisma.waste.groupBy({
                by: ['WasteType_ID'],
                _count: {
                    Waste_ID: true
                },
                where: { User_ID: Number(userId) }
            }),
            prisma.waste.count({
                where:
                {
                    User_ID: Number(userId),
                    Timestamp: {
                        gte: startOfWeek,
                        lte: now
                    }

                }
            }),
        ])

        const streak = await getStreak(userId)

        console.log(userData)
        console.log(wasteData)
        console.log(weekData)
        console.log(streak)

        res.status(200).json(
            {
                userName: userData.User_name,
                point: userData.Points,
                graph: wasteData,
                weekData: weekData,
                streak: streak
            }
        );


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" });
    }
};


export const getUsers = async (req, res) => {
    try {
        const currentPage = Number(req.query.current) || 1;
        const userName = req.query.username
        const limit = 11
        const offset = (currentPage - 1) * limit

        const [users, total] = await Promise.all(
            [
                prisma.user.findMany({
                    skip: offset,
                    take: limit,
                    where: {
                        User_name: userName ? { contains: userName } : undefined
                    }
                }),
                prisma.user.count({
                    where: {
                        User_name: userName ? { contains: userName } : undefined
                    }
                })
            ])

        console.log(users)


        const totalPage = Math.ceil(total / limit)
        console.log(total)

        res.status(200).json(
            {
                user: users,
                totalPage: totalPage
            }
        );


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server error" });
    }
};

export const editUser = async (req, res) => {
    try {
        const { userName, email, fullName, identify } = req.body

        const userId = await prisma.user.findUnique({
            where: {
                User_name: identify
            }
        })

        console.log(userId.User_ID)

        const updateUser = await prisma.user.update({
            where: {
                User_ID: userId.User_ID
            },
            data: {
                Full_name: fullName,
                Email: email,
                User_name: userName
            }
        })
        console.log(updateUser);
        res.status(200).json(updateUser)
    } catch (error) {
        console.log(error)
    }
}


export const deleteUser = async (req, res) => {
    try {
        const { identify } = req.body
        const deleteUser = await prisma.user.delete({
            where: {
                User_name: identify
            }
        })

        res.status(200).json(deleteUser)
    } catch (error) {
        console.log(error)
    }
}

export const vote = async (req, res) => {
    try {
        const { wasteID, userID, vote } = req.body

        console.log(vote)
        const addVoteDetail = await prisma.wasteVote.create({
            data: {
                Waste_ID: Number(wasteID),
                User_ID: Number(userID),
                Vote_Detail: vote
            }
        })

        const getWaste = await prisma.waste.findUnique({
            where: {
                Waste_ID: Number(wasteID)
            }
        })


        if (getWaste) {
            const score = getWaste.Vote_wastetype
            vote === 'ขยะอินทรีย์' ? score[0] += 1 : vote === 'ขยะอันตราย' ? score[1] += 1 : vote === 'ขยะทั่วไป' ? score[2] += 1 : score[3] += 1

            await prisma.waste.update({
                where: { Waste_ID: Number(wasteID) },
                data: {
                    Vote_wastetype: {
                        set: score
                    }
                }
            })
        }

        res.status(200)
    } catch (error) {
        console.log(error)
    }
}
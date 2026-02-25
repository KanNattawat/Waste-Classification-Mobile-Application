import { prisma } from "../prisma/prisma.js";
import seedrandom from 'seedrandom';
import { asyncHandler } from "../utils/asyncHandler.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../utils/s3.js"
import { History_Type } from '@prisma/client'


export const getUser = asyncHandler(async (req, res) => {
    const { userId } = req.query
    const user = await prisma.user.findUnique({
        where: { User_ID: Number(userId) },
        select: {
            User_name: true,
            Points: true
        }
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
})


export const uploadWaste = asyncHandler(async (req, res) => {
    const { user_id, wastetype, image_path, probs } = req.body

    const wasteMap = {
        "ขยะย่อยสลาย": 1,
        "ขยะอันตราย": 2,
        "ขยะทั่วไป": 3,
        "ขยะรีไซเคิล": 4
    };
    const wasteid = wasteMap[wastetype];
    if (!wasteid) {
        return res.status(400).json({ error: "Invalid waste type" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const canUpdatePoint = await prisma.waste.count({
        where: {
            User_ID: Number(user_id),
            Timestamp: {
                gte: today
            }
        }
    })
    const operations = [];

    operations.push(
        prisma.waste.create({
            data: {
                User_ID: Number(user_id),
                WasteType_ID: wasteid,
                Image_path: image_path,
                Probs: probs,
                Vote_wastetype: [0, 0, 0, 0]
            }
        }),
    )

    if (canUpdatePoint < 5) {
        operations.push(
            prisma.user.update({
                where: {
                    User_ID: Number(user_id)
                },
                data: {
                    Points: {
                        increment: 1
                    }
                }
            })
        )
        operations.push(
            prisma.pointHistory.create({
                data: {
                    User_ID: Number(user_id),
                    PointsChanged: 1,
                    History_Detail: 'uploadWaste',
                    History_Type: History_Type.GET
                }
            })
        )
    }

    const result = await prisma.$transaction(
        operations
    )
    const waste = result[0];
    res.status(201).json({ wasteid: waste.Waste_ID })
})

export const getHistory = asyncHandler(async (req, res) => {
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
})

export const getHistoryData = asyncHandler(async (req, res) => {
    const waste = req.query.wasteId;
    const userid = req.query.userId;
    if (!waste) {
        return res.status(400).json({ error: "not found wasteId" });
    }
    const [wasteData, isVote] = await Promise.all([
        prisma.waste.findFirst({
            where: { Waste_ID: Number(waste) },
        }),
        prisma.wasteVote.findFirst({
            where: { Waste_ID: Number(waste), User_ID: Number(userid) },
        })
    ])

    if (!wasteData) {
        return res.status(404).json({ error: "ไม่พบข้อมูล" });
    }

    res.status(200).json({ item: wasteData, isVoted: isVote ? true : false });
})



export const getWeekly = asyncHandler(async (req, res) => {
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
})

export const getStats = asyncHandler(async (req, res) => {
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
})


const getStreak = async (userId) => {
    try {
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
    } catch (error) {
        console.log('error:', error)
    }
}


//แยกขยะติดต่อกัน, สัปดาห์นี้แยกไป, สถิติการคัดแยกทั้งหมด, ชื่อ point
export const getHome = asyncHandler(async (req, res) => {
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
})




export const vote = asyncHandler(async (req, res) => {
    const { wasteID, userID, vote } = req.body

    const getWaste = await prisma.waste.findUnique({
        where: {
            Waste_ID: Number(wasteID)
        }
    })
    if (!getWaste) {
        return res.status(404).json({ error: "waste not found" })
    }

    const score = getWaste.Vote_wastetype
    if (vote === 'ขยะอินทรีย์') score[0] += 1;
    else if (vote === 'ขยะอันตราย') score[1] += 1;
    else if (vote === 'ขยะทั่วไป') score[2] += 1;
    else if (vote === 'ขยะรีไซเคิล') score[3] += 1;
    else {
        return res.status(400).json({ error: "invalid waste type" });
    }

    await prisma.$transaction([
        prisma.wasteVote.create({
            data: {
                Waste_ID: Number(wasteID),
                User_ID: Number(userID),
                Vote_Detail: vote
            }
        }),
        prisma.waste.update({
            where: { Waste_ID: Number(wasteID) },
            data: {
                Vote_wastetype: {
                    set: score
                }
            }
        }),
        prisma.user.update({
            where: {
                User_ID: Number(userID)
            },
            data: {
                Points: {
                    increment: 1
                }
            }
        }),
        prisma.pointHistory.create({
            data: {
                User_ID: Number(userID),
                PointsChanged: 1,
                History_Detail: 'voteEvent',
                History_Type: History_Type.GET
            }
        })
    ])

    res.status(200).json({ ok: true });
})


export const createRecycleShop = async (req, res) => {
    try {

        const { user_id, shop_name, tel_num, location, accepted_cate } = req.body;

        if (!user_id || !shop_name || !tel_num) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูล User_ID, Shop_name และ Tel_num ให้ครบถ้วน" });
        }

        const newShop = await prisma.recycleShop.create({
            data: {
                User_ID: Number(user_id),
                Shop_name: shop_name,
                Tel_num: tel_num,
                Location: location,
                Accepted_cate: accepted_cate,
                Status: false
            }
        });

        res.status(201).json({
            msg: "สร้างร้านรับซื้อขยะสำเร็จ",
            shop: newShop
        });

    } catch (error) {
        console.error("createRecycleShop error:", error);
        res.status(500).json({ error: "Server error", details: String(error) });
    }
};

export const getRecycleShops = async (req, res) => {
    try {
        const userId = req.query.userId;

        const whereCondition = userId ? { User_ID: Number(userId) } : {};

        const shops = await prisma.recycleShop.findMany({
            where: whereCondition
        });

        res.status(200).json(shops);
    } catch (error) {
        console.error("getRecycleShops error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateRecycleShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params; // รับ shopId จาก URL params
    const { shop_name, tel_num, location, accepted_cate, status } = req.body; // รับข้อมูลที่จะแก้ไขจาก body

    if (!shopId) {
        return res.status(400).json({ error: "จำเป็นต้องระบุ Shop ID" });
    }

    const existingShop = await prisma.recycleShop.findUnique({
        where: { Shop_ID: Number(shopId) }
    });

    if (!existingShop) {
        return res.status(404).json({ error: "ไม่พบร้านค้าที่ต้องการแก้ไข" });
    }

    const updateData = {};
    if (shop_name !== undefined) updateData.Shop_name = shop_name;
    if (tel_num !== undefined) updateData.Tel_num = tel_num;
    if (location !== undefined) updateData.Location = location;
    if (accepted_cate !== undefined) updateData.Accepted_cate = accepted_cate;

    const updatedShop = await prisma.recycleShop.update({
        where: { Shop_ID: Number(shopId) },
        data: updateData
    });

    res.status(200).json({
        msg: "อัปเดตข้อมูลร้านสำเร็จ",
        shop: updatedShop
    });
});


export const getUniqueWaste = asyncHandler(async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const { userId } = req.query
    const vote = await prisma.wasteVote.findMany({
        select: { Waste_ID: true },
        where: {
            User_ID: Number(userId),
            Timestamp: {
                lt: startOfToday
            }
        }
    })
    const excludedId = vote.map(x => x.Waste_ID)
    const wasteId = await prisma.waste.findMany({
        select: { Waste_ID: true },
        where: {
            User_ID: {
                not: Number(userId)
            },
            Timestamp: {
                lt: startOfToday
            },
            Is_correct: { equals: false },
            Waste_ID: { notIn: excludedId }
        },
        orderBy: {
            Waste_ID: "asc"
        }
    })
    const dateSeed = new Date().toISOString().split('T')[0];
    const rng = seedrandom(`${userId}-${dateSeed}`); //สุ่มเลข 0-1
    const shuffled = wasteId.sort(() => 0.5 - rng());
    const selectedIds = shuffled.slice(0, 5).map(item => item.Waste_ID);
    const waste = await prisma.waste.findMany({
        where: { Waste_ID: { in: selectedIds } },
        orderBy: {
            Waste_ID: "asc"
        }
    });
    res.status(200).json({ item: waste })
})

export const updateFeedback = asyncHandler(async (req, res) => {

    const { wasteId, status, selectedType } = req.body
    console.log('updateFeedback', wasteId, status, selectedType)
    if (!wasteId) {
        return res.status(400).json({ ok: false, message: 'wasteId is required' });
    }

    const update = status === false
        ? { Vote_wastetype: selectedType }
        : { Is_correct: status }

    const updateWaste = await prisma.waste.update({
        where: { Waste_ID: Number(wasteId) },
        data: update,

    })

    res.status(200).json({ ok: true })

})

export const getWaste = asyncHandler(async (req, res) => {
    const waste = req.query.wasteId;
    if (!waste) {
        return res.status(400).json({ error: "not found wasteId" });
    }
    const wasteData = await prisma.waste.findFirst({
        where: { Waste_ID: Number(waste) },
    })


    if (!wasteData) {
        return res.status(404).json({ error: "ไม่พบข้อมูล" });
    }

    res.status(200).json({ item: wasteData });

});

export const getS3UploadPresigned = asyncHandler(async (req, res) => {
    const { userId, contentType } = req.body;
    const allow = ["image/jpeg"];
    if (!allow.includes(contentType)) return res.status(400).json({ error: "Invalid contentType" });

    const ext = contentType.split("/")[1];
    const key = `waste/${userId}/${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });


    res.status(200).json({ url, key });
})

export const getPointHistory = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const [pointHistory, user] = await Promise.all([
        prisma.pointHistory.findMany({
            select: {
                PointHistory_ID: true,
                History_Detail: true,
                History_Type: true,
                Timestamp: true,
                PointsChanged: true
            },
            where: {
                User_ID: Number(userId)
            },
            orderBy: { Timestamp: 'desc' }
        }),
        prisma.user.findFirst({
            where: {
                User_ID: Number(userId)
            },
            select: {
                User_name: true,
                Points: true
            }
        })
    ])

    res.status(200).json({ user: user, point: pointHistory });
})



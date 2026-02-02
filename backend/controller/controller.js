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
            "ขยะทั่วไป": 4,
            "ขยะรีไซเคิล": 3
        };
        const wasteid = wasteMap[wastetype];
        console.log("probs:", probs)

        const img = await prisma.image.create({
            data: {
                User_ID: parseInt(user_id),
                Waste_ID: wasteid,
                Image_path: image_path,
                probs: probs
            }
        })
        res.json({ imgid: img.Image_ID })
    } catch (error) {
        console.log(error);
    }
}

export const getHistory = async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log(userId)
        const img = await prisma.image.findMany({
            where: { User_ID: Number(userId) }
        })

        res.status(200).json({
            msg: "getHistory Successful",
            img: img
        })
    } catch (error) {
        console.log(error);
    }
}

export const getHistoryData = async (req, res) => {
    try {
        // const userId = req.query.userId;
        const imageId = req.query.imageId;

        if (!imageId) {
            return res.status(400).json({ error: "Null imageId" });
        }

        const img = await prisma.image.findFirst({
            where: { Image_ID: Number(imageId) },
        });


        if (!img) {
            return res.status(404).json({ error: "ไม่พบข้อมูล" });
        }

        res.status(200).json({ item: img });
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

        const count = await prisma.image.count({
            where: {
                User_ID: Number(userId),
                timestamp: {
                    gte: oneWeekAgo,
                    lte: now
                }
            }
        });

        const img = await prisma.image.findMany({
            where: {
                User_ID: Number(userId),
                timestamp: {
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
        const hazardCount = await prisma.image.count({
            where: { User_ID: Number(userId), Waste_ID: 2 } // ขยะอันตราย
        });

        const biodegradableCount = await prisma.image.count({
            where: { User_ID: Number(userId), Waste_ID: 1 } // ขยะย่อยสลาย
        });

        const generalCount = await prisma.image.count({
            where: { User_ID: Number(userId), Waste_ID: 4 } // ขยะทั่วไป
        });

        const recyclableCount = await prisma.image.count({
            where: { User_ID: Number(userId), Waste_ID: 3 } // ขยะรีไซเคิล
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


export const getUsers = async (req, res) => {
    try {
        const currentPage = Number(req.query.current) || 1;
        const userName = req.query.username
        const limit = 11
        const offset = (currentPage - 1) * limit

        const [ users, total ] = await Promise.all(
            [
                prisma.user.findMany({
                    skip: offset,
                    take: limit,
                    where: {
                        User_name: userName ? { contains: userName } : undefined
                    }
                }),
                prisma.user.count({
                    where:{
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

export const editUser = async (req,res) =>{
    try {
        const {userName, email, fullName, identify} = req.body

        const userId = await prisma.user.findUnique({
            where:{
                User_name:identify
            }
        })

        console.log(userId.User_ID)

        const updateUser = await prisma.user.update({
            where:{
                User_ID:userId.User_ID
            },
            data:{
                Full_name:fullName,
                Email:email,
                User_name:userName
            }
        })
        console.log(updateUser);
        res.status(200).json(updateUser)
    } catch (error) {
        console.log(error)
    }
}


export const deleteUser = async (req,res) =>{
    try {
        const {identify} = req.body
        const deleteUser = await prisma.user.delete({
            where:{
                User_name:identify
            }
        })

        res.status(200).json(deleteUser)
    } catch (error) {
        console.log(error)
    }
}
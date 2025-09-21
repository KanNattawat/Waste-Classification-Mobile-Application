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
        console.log("probs:",probs)

        const img = await prisma.image.create({
            data: {
                User_ID: parseInt(user_id),
                Waste_ID: wasteid,
                Image_path: image_path,
                probs:probs
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
            where:{User_ID: Number(userId)}
        })

        res.status(200).json({
            msg:"getHistory Successful",
            img:img
        })
    } catch (error) {
        console.log(error);
    }
}

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

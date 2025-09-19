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
        const { user_id, wastetype, image_path } = req.body

        const wasteMap = {
            "ขยะย่อยสลาย": 1,
            "ขยะอันตราย": 2,
            "ขยะทั่วไป": 3,
            "ขยะรีไซเคิล": 4
        };
        const wasteid = wasteMap[wastetype];

        const db = await prisma.image.create({
            data: {
                User_ID: parseInt(user_id),
                Waste_ID: wasteid,
                Image_path: image_path,
            }
        })
        res.json("อัปโหลดลง storage สำเร็จ")
    } catch (error) {
        console.log(error);
    }
}

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

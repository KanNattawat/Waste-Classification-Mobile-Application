import { request, response } from "express";
import { prisma } from "../prisma/prisma.js"
import bcrypt from 'bcrypt';


export const Register = async (req, res) => {
    try {
        const { User_email, User_name, User_password, Full_name } = req.body;
        if (!User_email || !User_name || !User_password || !Full_name) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }
        const check = await prisma.user.findUnique({
            where: { User_email: User_email }
        });

        if (check) {
            return res.status(400).json({ error: "username นี้มีผู้ใช้เเล้ว" })
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(User_password, saltRounds);

        const user = await prisma.user.create({
            data: {
                User_email,
                User_name,
                User_password: hashedPassword,
                Full_name
            }
        });
        res.json("เพิ่มผู้ใช้สำเร็จ");
    } catch (error) {
        console.log(error)
        res.status(500).json({ "errorจ้า": error });
    }
};


export const Login = async (req, res) => {
    try {

    } catch (error) {
        console.log(error)
        res.status(500).json({ "errorจ้า": error });
    }
}
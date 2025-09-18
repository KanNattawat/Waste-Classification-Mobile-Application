import { request, response } from "express";
import { prisma } from "../prisma/prisma.js"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const Register = async (req, res) => {
    try {
        const {User_name, User_password, Full_name } = req.body;
        if ( !User_name || !User_password || !Full_name) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }
        const check = await prisma.user.findUnique({
            where: { User_name: User_name }
        });

        if (check) {
            return res.status(400).json({ error: "Username นี้มีผู้ใช้เเล้ว" })
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(User_password, saltRounds);

        const user = await prisma.user.create({
            data: {
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
        const { User_name, User_password } = req.body
        if (!User_name || !User_password) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }


        const user = await prisma.user.findUnique({
            where: { User_name: User_name }
        });
        if (!user) {
            return res.status(400).json({ error: "username หรือ password ไม่ถูกต้อง" })
        }

        const check = await bcrypt.compare(User_password, user.User_password);
        if (!check) {
            return res.status(400).json({ error: "username หรือ password ไม่ถูกต้อง" })
        }

        const JWT_SECRET = process.env.JWT;
        const token = jwt.sign({ userId: user.User_ID }, JWT_SECRET, {
            expiresIn: "1h",
        });



        res.status(200).json({
            message: "Login Successful!!",
            token
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ "errorจ้า": error });
    }
}


export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecret");
        req.user = decoded; // เก็บข้อมูล userId, email ฯลฯ
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
import { prisma } from "../prisma/prisma.js"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { transporter } from "../utils/mailer.js";

const { Role } = pkg;

export const Register = async (req, res) => {
    try {
        const { User_name, User_password, Full_name, Email } = req.body;
        if (!User_name || !User_password || !Full_name || !Email) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }
        const check = await prisma.user.findUnique({
            where: { User_name: User_name }
        });

        if (check) {
            return res.status(400).json({ error: "Username นี้มีผู้ใช้เเล้ว" })
        }

        if (User_password.trim().length < 8) {
            return res.status(400).json({ error: "Password ต้องมีความยาวอย่างน้อย 8 หลัก" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(Email)) {
            return res.status(400).json({ error: "รูปแบบ Email ไม่ถูกต้อง" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(User_password, saltRounds);

        const user = await prisma.user.create({
            data: {
                User_name,
                User_password: hashedPassword,
                Full_name,
                Email
            }
        });
        res.json("เพิ่มผู้ใช้สำเร็จ");
    } catch (error) {
        console.log(error)
        res.status(500).json({ "error": error });
    }
};


export const adminRegister = async (req, res) => {
    try {
        const { User_name, User_password } = req.body;
        if (!User_name || !User_password) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }
        const check = await prisma.user.findUnique({
            where: { User_name: User_name }
        });

        if (check) {
            return res.status(400).json({ error: "Username นี้มีผู้ใช้เเล้ว" })
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(String(User_password), saltRounds);

        const user = await prisma.user.create({
            data: {
                User_name,
                Full_name: "Admin",
                Email: "Admin@g.com",
                User_password: hashedPassword,
                Role: Role.ADMIN
            }
        });
        res.status(201).json("เพิ่มผู้ใช้สำเร็จ");
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
        const check = await bcrypt.compare(String(User_password), user.User_password);
        if (!check) {
            return res.status(400).json({ error: "username หรือ password ไม่ถูกต้อง" })
        }
        const JWT_SECRET = process.env.JWT;
        const token = jwt.sign({ userId: user.User_ID, userRole: user.Role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            message: "Login Successful",
            token,
            userId: user.User_ID,
            userRole: user.Role
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ "errorจ้า": error });
    }
}

export const sendFotgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await prisma.user.findFirst({
        where: {
            Email: email
        }
    })
    if (!user) {
        return res.status(400).json({ error: "not found email" })
    }
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const resetToken = await prisma.passwordResetToken.create({
        data: {
            User_ID: user.User_ID,
            Expires_at: expiresAt
        }
    })
    console.log(resetToken)
    const generatedToken = resetToken.ResetToken

    const resetLink = `${process.env.APP_URL}/reset?token=${generatedToken}`;
    const mailOptions = {
        from: `"EasySort App Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'คำขอรีเซ็ตรหัสผ่านของคุณในแอปพลิเคชัน EasySort',
        html: `
      <h1>รีเซ็ตรหัสผ่าน</h1>
      <p>คุณได้รับอีเมลนี้เพราะมีการขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
      <p>กรุณาคลิกลิงก์ด้านล่างเพื่อดำเนินการต่อ (ลิงก์นี้มีอายุ 30 นาที):</p>
      <a href="${resetLink}" style="padding: 10px 20px; background-color: #1E8B79; color: white; text-decoration: none; border-radius: 5px;">รีเซ็ตรหัสผ่านตอนนี้</a>
      <p>หากคุณไม่ได้เป็นคนทำรายการนี้ กรุณาเพิกเฉยต่ออีเมลนี้</p>
    `
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ ok: true })
})

export const FotgotPassword = asyncHandler(async (req, res) => {
    const { token, Password } = req.body
    const is_token_valid = await prisma.passwordResetToken.findUnique({
        where: {
            ResetToken: token
        }
    })
    if (!is_token_valid) {
        return res.status(400).json({ error: "token is not valid" })
    }

    if (Password.trim().length < 8) {
        return res.status(400).json({ error: "Password ต้องมีความยาวอย่างน้อย 8 หลัก" })
    }

    const currentTime =  new Date()
    if(is_token_valid.Expires_at < currentTime ){
        return res.status(400).json({ error: "token has expired" })
    }


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);
    const userId = is_token_valid.User_ID

    await prisma.$transaction([
        prisma.user.update({
            where: {
                User_ID: userId
            },
            data: {
                User_password: hashedPassword
            }
        })
        ,
        prisma.passwordResetToken.delete({
            where: {
                ResetToken: is_token_valid.ResetToken
            }
        })
    ])


    return res.status(200).json({ ok: true })
})


export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err)
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

// userId: user.User_ID,
// userRole: user.Role

export const adminCheck = (req, res, next) => {
    if (req.user.userRole === "ADMIN") {
        next()
    }
    else {
        res.status(401).json({ 'error': 'unauthorized' })
    }
}
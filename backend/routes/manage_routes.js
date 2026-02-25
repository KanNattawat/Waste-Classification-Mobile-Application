import express from "express"
import multer from "multer"; // 🌟 เพิ่มบรรทัดนี้
import * as controller from "../controller/manage_controller.js";
import { authMiddleware, adminCheck } from '../controller/auth_controller.js';

const manage_router = express.Router()

const upload = multer({ storage: multer.memoryStorage() });

manage_router.get('/getusers',authMiddleware, adminCheck, controller.getUsers);
manage_router.post('/edituser',authMiddleware, adminCheck ,controller.editUser);
manage_router.delete('/deleteuser',authMiddleware, adminCheck ,controller.deleteUser);
manage_router.get('/waste',authMiddleware, adminCheck, controller.getWaste);
manage_router.post('/s3-multi-presigned', authMiddleware, adminCheck,controller.getS3MultiDownloadPresigned);

manage_router.get("/getallitem", controller.getPointShops);
manage_router.get("/getallitem/:id", controller.getPointShopById);

manage_router.post("/createitem", authMiddleware, upload.single('Image_path'), adminCheck, controller.createPointShops);
manage_router.put("/updateitem/:id", authMiddleware, upload.single('Image_path'), adminCheck, controller.updatePointShop);
manage_router.delete("/deleteitem/:id", authMiddleware, adminCheck, controller.deletePointShop);

export default manage_router;
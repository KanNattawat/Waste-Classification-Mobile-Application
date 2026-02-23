import express from "express"
import * as controller from "../controller/manage_controller.js";
import { authMiddleware, adminCheck } from '../controller/auth_controller.js';

const manage_router = express.Router()


manage_router.get('/getusers',authMiddleware, adminCheck, controller.getUsers);
manage_router.post('/edituser',authMiddleware, adminCheck ,controller.editUser);
manage_router.delete('/deleteuser',authMiddleware, adminCheck ,controller.deleteUser);
manage_router.get('/waste',authMiddleware, adminCheck, controller.getWaste);

manage_router.get("/getallitem", authMiddleware, adminCheck, controller.getPointShops);
manage_router.post("/createitem", authMiddleware, adminCheck, controller.createPointShops);
manage_router.put("/updateitem/:id", authMiddleware, adminCheck, controller.updatePointShop);
manage_router.delete("/deleteitem/:id", authMiddleware, adminCheck, controller.deletePointShop);


export default manage_router
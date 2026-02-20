import express from "express"
import * as controller from "../controller/manage_controller.js";
import { authMiddleware, adminCheck } from '../controller/auth_controller.js';

const manage_router = express.Router()


manage_router.get('/getusers',authMiddleware, adminCheck, controller.getUsers);
manage_router.post('/edituser',authMiddleware, adminCheck ,controller.editUser);
manage_router.delete('/deleteuser',authMiddleware, adminCheck ,controller.deleteUser);
manage_router.get('/waste',authMiddleware, adminCheck, controller.getWaste);


export default manage_router
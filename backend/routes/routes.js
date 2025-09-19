import express from "express"
import * as controller from "../controller/controller.js";
import { authMiddleware } from '../controller/auth_controller.js';

const router = express.Router()

router.get('/getme', authMiddleware, controller.getMe);

export default router
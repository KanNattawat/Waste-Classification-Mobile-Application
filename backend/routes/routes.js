import express from "express"
import * as controller from "../controller/controller.js";
import { authMiddleware } from '../controller/auth_controller.js';

const router = express.Router()

router.get('/getme', controller.getMe);
router.post('/wasteupload', controller.uploadtoStorage);
router.get('/gethistory', controller.getHistory);
router.get('/getweekly', controller.getWeekly);
router.get('/gethistorybyid', controller.getHistoryData);
export default router
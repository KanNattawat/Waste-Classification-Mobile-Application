import express from "express"
import * as controller from "../controller/controller.js";
import * as authController from "../controller/auth_controller.js"
import { authMiddleware, adminCheck } from '../controller/auth_controller.js';

const router = express.Router()

router.get('/getme',authMiddleware , controller.getMe);
router.post('/wasteupload', controller.uploadWaste);
router.get('/gethistory', controller.getHistory);
router.get('/getweekly', controller.getWeekly);
router.get('/gethistorybyid', controller.getHistoryData);
router.get('/getstats',authMiddleware , controller.getStats);
router.get('/home', controller.getHome);
router.post('/vote', controller.vote);
router.get('/uniqueWaste', controller.getUniqueWaste);
router.put('/updateFeedback', controller.updateFeedback);
router.get('/getWaste', controller.getWaste)

router.get('/getusers',authMiddleware, adminCheck, controller.getUsers);
router.post('/edituser',authMiddleware, adminCheck ,controller.editUser);
router.delete('/deleteuser',authMiddleware, adminCheck ,controller.deleteUser);
router.post('/addAdmin', authController.adminRegister);
export default router
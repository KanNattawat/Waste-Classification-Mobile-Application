import express from "express"
import * as controller from "../controller/controller.js";
import * as authController from "../controller/auth_controller.js"
import { authMiddleware, adminCheck } from '../controller/auth_controller.js';

const router = express.Router()

router.get('/user', controller.getUser);
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
router.post('/recycle-shop', controller.createRecycleShop);
router.get('/recycle-shop2', controller.getRecycleShops);
router.put('/update_recycle-shop', controller.updateRecycleShop);
router.get('/pointHistory', controller.getPointHistory)
router.post('/redeem', authMiddleware, controller.redeemItem);
router.post('/s3-uploadpresigned', controller.getS3UploadPresigned);


export default router
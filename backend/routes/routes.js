import express from "express"
import * as controller from "../controller/controller.js";

const router = express.Router()

router.post("/register", controller.Register)
router.get("/login", controller.Login)

//ใส่ middleware เช็ค token ด้วย
export default router
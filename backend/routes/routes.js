import express from "express"
import * as controller from "../controller/controller.js";

const router = express.Router()

router.post("/register", controller.Register)


export default router
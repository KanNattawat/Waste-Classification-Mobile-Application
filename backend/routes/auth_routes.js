import express from "express"
import * as controller from "../controller/auth_controller.js";

const auth_router = express.Router()

auth_router.post("/register", controller.Register)
auth_router.post("/login", controller.Login)
auth_router.post('/addAdmin', controller.adminRegister);
auth_router.post("/sendForgotpassword", controller.sendFotgotPassword)
auth_router.post("/forgotpassword", controller.FotgotPassword)

export default auth_router
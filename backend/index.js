import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
import auth_router from './routes/auth_routes.js';
import router from './routes/routes.js'; 
import { authMiddleware } from "./controller/auth_controller.js";

dotenv.config();
const app = express();
app.use(express.json());



app.use("/auth", auth_router);
app.use("/", authMiddleware, router)

app.listen(process.env.PORT, async () => {
    console.log('Service running');
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
import auth_router from './routes/auth_routes.js';
import router from './routes/routes.js'; 
import { authMiddleware } from "./controller/auth_controller.js";
import helmet from "helmet";

dotenv.config();
const app = express();
app.use(express.json());

app.use(helmet())

app.use("/auth", auth_router);
app.use("/", router)

app.listen(process.env.PORT, async () => {
    console.log('Service running');
});
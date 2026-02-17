import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import auth_router from './routes/auth_routes.js';
import router from './routes/routes.js'; 
import helmet from "helmet";
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,                
}));

app.use(helmet())

app.use("/auth", auth_router);
app.use("/", router)

app.listen(process.env.PORT, async () => {
    console.log('Service running at', process.env.PORT);
});
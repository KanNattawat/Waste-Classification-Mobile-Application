import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
import routes from './routes/routes.js';

dotenv.config();
const app = express();
app.use(express.json());



app.use("/", routes);

app.listen(process.env.PORT, async () => {
    console.log('Service running');
});
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import fs from "fs";
import https from "https";

import auth_router from "./routes/auth_routes.js";
import router from "./routes/routes.js";
import { authMiddleware } from "./controller/auth_controller.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// routes
app.use("/auth", auth_router);
app.use("/", router);

const sslOptions = {
  key: fs.readFileSync("./cert/key.pem"),   // path ไปยัง private key
  cert: fs.readFileSync("./cert/cert.pem"), // path ไปยัง certificate
};

const PORT = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS Server is running on port ${PORT}`);
});

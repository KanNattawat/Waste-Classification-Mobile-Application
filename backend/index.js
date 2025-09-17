import express from "express"; // ถ้าใช้ ES Module
// const express = require("express"); // ถ้าใช้ CommonJS

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

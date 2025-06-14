import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

await connectDB();

app.get("/", (_req, res) => {
  res.send("Collabridge API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

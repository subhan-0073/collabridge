import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import projectRoutes from "./routes/project.routes";
import teamRoutes from "./routes/team.routes";
import commentRoutes from "./routes/comment.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
  express.json()
);

await connectDB();

app.get("/", (_req, res) => {
  res.send("Collabridge API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/", commentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

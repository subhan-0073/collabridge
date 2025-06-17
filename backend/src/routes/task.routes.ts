import { Router } from "express";
import {
  createTask,
  getTasks,
  getTasksById,
  deleteTask,
  updateTask,
} from "../controllers/task.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.get("/:id", authMiddleware, getTasksById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;

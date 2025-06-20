import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
  updateTask,
} from "../controllers/task.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);

router.get("/:id", authMiddleware, getTaskById);
router.patch("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;

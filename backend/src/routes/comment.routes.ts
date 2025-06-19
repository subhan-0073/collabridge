import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createComment,
  deleteComment,
  getCommentsForTask,
} from "../controllers/comment.controller";

const router = Router();

router.post("/tasks/:taskId/comments", authMiddleware, createComment);
router.get("/tasks/:taskId/comments", authMiddleware, getCommentsForTask);
router.delete("/comments/:id", authMiddleware, deleteComment);

export default router;

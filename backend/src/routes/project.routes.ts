import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";

const router = Router();

router.get("/", authMiddleware, getProjects);
router.post("/", authMiddleware, createProject);

router.get("/:id", authMiddleware, getProjectById);
router.patch("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;

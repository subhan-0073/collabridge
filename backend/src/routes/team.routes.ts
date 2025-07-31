import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/team.controller.js";

const router = Router();

router.get("/", authMiddleware, getTeams);
router.post("/", authMiddleware, createTeam);

router.get("/:id", authMiddleware, getTeamById);
router.patch("/:id", authMiddleware, updateTeam);
router.delete("/:id", authMiddleware, deleteTeam);

export default router;

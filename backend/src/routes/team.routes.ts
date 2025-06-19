import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/team.controller";

const router = Router();

router.get("/", authMiddleware, getTeams);
router.post("/", authMiddleware, createTeam);

router.get("/:id", authMiddleware, getTeamById);
router.put("/:id", authMiddleware, updateTeam);
router.delete("/:id", authMiddleware, deleteTeam);

export default router;

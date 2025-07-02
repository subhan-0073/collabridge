import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { updateUsername } from "../controllers/user.controller";

const router = Router();

router.patch("/me/username", authMiddleware, updateUsername);

export default router;

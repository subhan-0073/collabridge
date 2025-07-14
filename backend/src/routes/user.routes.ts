import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getAllUsers, updateUsername } from "../controllers/user.controller";

const router = Router();

router.get("/", authMiddleware, getAllUsers);
router.patch("/me/username", authMiddleware, updateUsername);

export default router;

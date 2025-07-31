import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getAllUsers, updateUsername } from "../controllers/user.controller.js";

const router = Router();

router.get("/", authMiddleware, getAllUsers);
router.patch("/me/username", authMiddleware, updateUsername);

export default router;

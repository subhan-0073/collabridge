import mongoose from "mongoose";
import { Request, Response } from "express";
import { User } from "../models/user.model";

export const updateUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { username } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId))
    return void res.status(400).json({
      message: "Invalid user ID",
      data: null,
    });

  if (!username || typeof username !== "string")
    return void res.status(400).json({
      message: "Username is required",
      data: null,
    });

  const trimmed = username.trim().toLowerCase();

  const isValidPattern = /^[a-z0-9_]{3,20}$/.test(trimmed);
  if (!isValidPattern) {
    return void res.status(400).json({
      message:
        "Username must be 3-20 characters, lowercase letters, numbers, or underscores only",
    });
  }

  const existing = await User.findOne({ username: trimmed });

  if (existing && existing._id.toString() !== userId) {
    return void res.status(409).json({ message: "Username already taken" });
  }

  const user = await User.findById(userId).select(
    "+previousUsernames +lastUsernameChange"
  );
  if (!user) {
    return void res.status(404).json({ message: "User not found" });
  }

  const now = new Date();

  const lastChange = user.lastUsernameChange || new Date(0);

  const diffDays =
    (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 30) {
    return void res.status(403).json({
      message: `You can change username again after ${Math.ceil(
        30 - diffDays
      )} day(s)`,
    });
  }

  if (user.username === trimmed) {
    return void res.status(400).json({
      message: "This is already your current username",
    });
  }

  if (user.username !== trimmed) {
    user.previousUsernames?.push(user.username);
    user.username = trimmed;
    user.lastUsernameChange = now;
    await user.save();
  }

  return void res.status(200).json({
    message: "Username updated successfully",
    data: {
      id: user._id,
      username: user.username,
    },
  });
};

import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password)
      return void res
        .status(400)
        .json({ message: "All fields are required", data: null });

    const trimmed = username?.trim().toLowerCase();
    if (!trimmed || !/^[a-z0-9_]{3,20}$/.test(trimmed)) {
      return void res.status(400).json({
        message:
          "Username must be 3–20 chars, lowercase, numbers or underscores only",
        data: null,
      });
    }

    const existingUsername = await User.findOne({ username: trimmed });
    if (existingUsername) {
      return void res
        .status(409)
        .json({ message: "Username already taken", data: null });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return void res
        .status(409)
        .json({ message: "User already exists", data: null });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username: trimmed,
      email,
      password: hashedPassword,
    });
    const token = signToken({ id: user._id.toHexString() });

    return void res.status(201).json({
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error", data: null });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return void res
        .status(400)
        .json({ message: "All fields are required", data: null });

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.toLowerCase().trim() },
      ],
    }).select("+password");

    if (!user)
      return void res
        .status(401)
        .json({ message: "Invalid credentials", data: null });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return void res
        .status(401)
        .json({ message: "Invalid credentials", data: null });

    const token = signToken({ id: user._id.toHexString() });

    return void res.status(200).json({
      message: "User logged in successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error", data: null });
  }
};

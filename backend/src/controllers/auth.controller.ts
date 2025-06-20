import { Request, Response } from "express";
import { User } from "../models/user.model";
import { signToken } from "../utils/jwt";
import bcrypt from "bcrypt";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return void res
        .status(400)
        .json({ message: "All fields are required", data: null });

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return void res
        .status(409)
        .json({ message: "User already exists", data: null });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = signToken({ id: user._id.toHexString() });

    return void res.status(201).json({
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
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
    const { email, password } = req.body;
    if (!email || !password)
      return void res
        .status(400)
        .json({ message: "All fields are required", data: null });

    const user = await User.findOne({ email }).select("+password");
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
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error", data: null });
  }
};

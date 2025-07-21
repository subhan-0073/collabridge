import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/user.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return void res.status(401).json({ message: "Unauthorized: No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return void res
        .status(401)
        .json({ message: "Unauthorized: User not found" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return void res
      .status(401)
      .json({ message: "Unauthorized: Invalid token" });
  }
};

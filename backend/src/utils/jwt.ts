import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export interface JwtPayload {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = "7d";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

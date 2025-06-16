import { Schema, model } from "mongoose";
import { IUser } from "../models/user.types";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    avatar: { type: String, default: "" },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);
export const User = model<IUser>("User", userSchema);

import { Schema, model } from "mongoose";
import { IUser } from "../models/user.types.js";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-z0-9_]{3,20}$/,
      set: (v: string) => v.toLowerCase(),
    },

    email: {
      type: String,
      required: true,
      unique: true,
      set: (v: string) => v.toLowerCase(),
    },
    password: { type: String, required: true, select: false },

    avatar: { type: String, default: "" },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },

    previousUsernames: {
      type: [String],
      default: [],
    },

    lastUsernameChange: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
export const User = model<IUser>("User", userSchema);
export const userPublicFields =
  "-email -password -previousUsernames -lastUsernameChange -__v";

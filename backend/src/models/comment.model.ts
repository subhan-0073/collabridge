import { model, Schema } from "mongoose";
import { IComment } from "./comment.types.js";

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

export const Comment = model<IComment>("Comment", commentSchema);
export const commentPublicFields = "-__v";

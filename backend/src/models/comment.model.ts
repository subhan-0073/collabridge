import { model, Schema } from "mongoose";
import { IComment } from "./comment.types";

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },

    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  },

  {
    timestamps: true,
  }
);

export const Comment = model<IComment>("Comment", commentSchema);

import { model, Schema } from "mongoose";
import { ITask } from "./task.types";

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },

    dueDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    commentsCount: { type: Number, default: 0 },
    attachments: [String],
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);

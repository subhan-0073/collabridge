import { model, Schema } from "mongoose";
import { ITask } from "./task.types.js";

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
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    order: { type: Number, default: 0 },

    commentsCount: { type: Number, default: 0 },
    attachments: [String],
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);
export const taskPublicFields = "-__v";

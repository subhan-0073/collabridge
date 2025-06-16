import { Types } from "mongoose";

export interface ITask {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  dueDate?: Date;
  assignedTo?: Types.ObjectId;
  project: Types.ObjectId;
  createdBy: Types.ObjectId;
  priority?: "low" | "medium" | "high";
  commentsCount?: number;
  attachments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

import { Types } from "mongoose";

export interface IComment {
  content: string;
  author: Types.ObjectId;
  task: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

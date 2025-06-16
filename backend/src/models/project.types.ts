import { Types } from "mongoose";

export interface IProject {
  name: string;
  description: string;
  team: Types.ObjectId;

  members?: Types.ObjectId[];
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

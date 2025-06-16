import { Types } from "mongoose";

export interface ITeam {
  name: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

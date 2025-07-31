import { Schema, model } from "mongoose";
import { ITeam } from "./team.types.js";

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    members: [
      { type: Schema.Types.ObjectId, ref: "User", default: [], index: true },
    ],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Team = model<ITeam>("Team", teamSchema);
export const teamPublicFields = "-__v";

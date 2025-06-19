import { Schema, model } from "mongoose";
import { ITeam } from "./team.types";

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Team = model<ITeam>("Team", teamSchema);

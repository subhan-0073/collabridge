import { model, Schema } from "mongoose";
import { IProject } from "./project.types";

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },

    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>("Project", projectSchema);

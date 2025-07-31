import { model, Schema } from "mongoose";
import { IProject } from "./project.types.js";

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },

    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>("Project", projectSchema);
export const projectPublicFields = "-__v";

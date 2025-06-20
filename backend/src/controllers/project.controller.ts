import { Request, Response } from "express";
import { Project, projectPublicFields } from "../models/project.model";
import { userPublicFields } from "../models/user.model";
import { teamPublicFields } from "../models/team.model";
import mongoose from "mongoose";

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, team, members } = req.body;

    if (typeof name !== "string" || !name.trim())
      return void res.status(400).json({
        message: "Project name is required and must be a valid string",
      });

    if (!team || !mongoose.Types.ObjectId.isValid(team))
      return void res
        .status(400)
        .json({ message: "A valid Team ID is required" });

    let validMembers: string[] | undefined = undefined;
    if (members !== undefined) {
      if (
        !Array.isArray(members) ||
        !members.every(
          (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
        )
      )
        return void res.status(400).json({ message: "Invalid members list" });
      validMembers = members;
    }

    const project = await Project.create({
      name,
      description:
        typeof description === "string" ? description.trim() : undefined,
      team,
      members: validMembers,
      createdBy: req.user?.id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("team", teamPublicFields)
      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(projectPublicFields)
      .lean();

    return void res.status(201).json({
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }],
    })
      .populate("team", teamPublicFields)
      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(projectPublicFields)
      .lean();

    return void res.status(200).json({ project: projects });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Project ID" });

  try {
    const project = await Project.findById(id)
      .populate("team", teamPublicFields)
      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(projectPublicFields)
      .lean();

    if (!project)
      return void res.status(404).json({ message: "Project not found" });

    const userId = req.user?.id;
    if (
      project.createdBy._id.toString() !== userId &&
      !project.members?.some((m) => m._id.toString() === userId)
    )
      return void res.status(403).json({ message: "Access denied" });

    return void res.status(200).json({ project: project });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Project ID" });

  try {
    const project = await Project.findById(id);
    if (!project)
      return void res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== req.user?.id)
      return void res.status(403).json({
        message: "Forbidden: Only project creator can update this team",
      });

    const { name, description, team, members } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim())
        return void res.status(400).json({
          message: "Project name is required and must be a valid string",
        });
      project.name = name.trim();
    }
    if (description !== undefined) {
      if (typeof description !== "string")
        return void res
          .status(400)
          .json({ message: "Description must be valid" });
      project.description = description;
    }

    if (team !== undefined) {
      if (!team || !mongoose.Types.ObjectId.isValid(team))
        return void res
          .status(400)
          .json({ message: "A valid Team ID is required" });
      project.team = team;
    }

    if (members !== undefined) {
      if (
        !Array.isArray(members) ||
        !members.every(
          (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
        )
      )
        return void res.status(400).json({ message: "Invalid members list" });
      project.members = members;
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("team", teamPublicFields)
      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(projectPublicFields)
      .lean();

    return void res.status(200).json({
      message: "Project updated successfully",
      project: populatedProject,
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid project ID" });

  try {
    const project = await Project.findById(id);
    if (!project)
      return void res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== req.user?.id)
      return void res.status(403).json({
        message: "Forbidden: Only project creator can delete this team",
      });

    await project.deleteOne();

    return void res
      .status(200)
      .json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Project } from "../models/project.model";

export const createProject = async (req: Request, res: Response) => {
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
    const project = await new Project({
      name,
      description:
        typeof description === "string" ? description.trim() : undefined,
      team,
      members: validMembers,
      createdBy: req.user?.id,
    }).save();

    res.status(201).json({ message: "Project created successfully", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }],
    })
      .populate("team")
      .populate("members");
    res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({ message: "Invalid Project ID" });
  }

  try {
    const project = await Project.findById(id)
      .populate("team")
      .populate("members")
      .populate("createdBy");

    if (!project)
      return void res.status(404).json({ message: "Project not found" });
    const userId = req.user?.id;
    if (
      project.createdBy.toString() !== userId &&
      !project.members?.map((id) => id.toString()).includes(userId)
    )
      return void res.status(403).json({ message: "Access denied" });

    res.status(200).json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Project ID" });

  try {
    const project = await Project.findById(id);

    if (!project)
      return void res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== req.user?.id)
      return void res
        .status(403)
        .json({ message: "Forbidden: Not your project" });

    const { name, description, team, members } = req.body;

    if (typeof name !== "string" || !name.trim())
      return void res.status(400).json({
        message: "Project name is required and must be a valid string",
      });

    project.name = name.trim();

    if (typeof description !== "string")
      return void res
        .status(400)
        .json({ message: "Description must be valid" });
    if (description.trim()) project.description = description.trim();

    if (!team || !mongoose.Types.ObjectId.isValid(team))
      return void res
        .status(400)
        .json({ message: "Valid team ID is required" });
    if (members !== undefined) {
      if (
        !Array.isArray(members) ||
        !members.every(
          (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
        )
      )
        return void res.status(400).json({ members: "Invalid members list" });

      project.members = members;
    }
    const updatedProject = await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid project ID" });

  try {
    const project = await Project.findById(id);

    if (!project)
      return void res.status(404).json({ message: "Project not found" });

    if (project.createdBy.toString() !== req.user?.id)
      return void res
        .status(403)
        .json({ message: "Forbidden: Not your project" });

    await project.deleteOne();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

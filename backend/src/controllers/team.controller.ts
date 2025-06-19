import { Request, Response } from "express";
import { Team } from "../models/team.model";
import mongoose from "mongoose";

export const createTeam = async (req: Request, res: Response) => {
  const { name, members } = req.body;
  if (typeof name !== "string" || !name.trim())
    return void res
      .status(400)
      .json({ message: "Team name is required and must be valid" });
  if (members !== undefined) {
    if (
      !Array.isArray(members) ||
      !members.every(
        (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      )
    )
      return void res.status(400).json({ message: "Invalid members list" });
  }
  try {
    const team = await new Team({
      name: name.trim(),
      members: [req.user?.id, ...(members || [])],
      createdBy: req.user?.id,
    });

    await team.save();
    res.status(200).json({ message: "Team created successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getTeams = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const teams = await Team.find({
      $or: [{ createdBy: userId }, { members: userId }],
    })

      .populate("members")
      .populate("createdBy");

    res.status(200).json({ teams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Team ID" });

  try {
    const team = await Team.findById(id)
      .populate("members")
      .populate("createdBy");

    if (!team) return void res.status(404).json({ message: "Team not found" });

    const userId = req.user?.id;

    if (
      team.createdBy._id.toString() !== userId &&
      !team.members.map((m) => m._id.toString()).includes(userId)
    )
      return void res.status(403).json({ message: "Forbidden: Access denied" });

    res.status(200).json({ team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Team ID" });
  try {
    const team = await Team.findById(id);
    if (!team) return void res.status(404).json({ message: "Team not found" });
    const { name, members } = req.body;

    if (team.createdBy._id.toString() !== req.user?.id)
      return void res.status(403).json({
        message: "Forbidden: Only team creator can update this team ",
      });
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim())
        return void res
          .status(400)
          .json({ message: "Team name must be a string" });
      team.name = name;
    }

    if (members !== undefined) {
      if (
        !Array.isArray(members) ||
        !members.every(
          (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
        )
      )
        return void res.status(400).json({ message: "Invalid members list" });

      team.members = members;
    }

    const updateTeam = await team.save();

    res
      .status(200)
      .json({ message: "Team updated successfully", team: updateTeam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Team ID" });

  try {
    const team = await Team.findById(id);

    if (!team) return void res.status(404).json({ message: "Team not found" });

    if (team.createdBy._id.toString() !== req.user?.id)
      return void res.status(403).json({
        message: "Forbidden: Only team creator can delete this team ",
      });

    await team.deleteOne();

    res.status(200).jsonp({ message: "Team deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

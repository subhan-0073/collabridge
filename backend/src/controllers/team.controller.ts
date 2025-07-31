import { Request, Response } from "express";
import { Team, teamPublicFields } from "../models/team.model.js";
import { userPublicFields } from "../models/user.model.js";
import mongoose from "mongoose";

export const createTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, members } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return void res.status(400).json({
      message: "Team name is required and must be valid",
      data: null,
    });
  }
  if (members !== undefined) {
    if (
      !Array.isArray(members) ||
      !members.every(
        (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      )
    )
      return void res.status(400).json({
        message: "Invalid members list",
        data: null,
      });
  }
  try {
    const team = await Team.create({
      name: name.trim(),
      members: [req.user?.id, ...(members || [])],
      createdBy: req.user?.id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(teamPublicFields)
      .lean();

    return void res.status(201).json({
      message: "Team created successfully",
      data: { team: populatedTeam },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  try {
    const teams = await Team.find({
      $or: [{ createdBy: userId }, { members: userId }],
    })

      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(teamPublicFields)
      .lean();

    return void res.status(200).json({
      message: "Teams fetched successfully",
      data: { teams },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const getTeamById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({
      message: "Invalid Team ID",
      data: null,
    });

  try {
    const team = await Team.findById(id)
      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(teamPublicFields)
      .lean();

    if (!team) {
      return void res.status(404).json({
        message: "Team not found",
        data: null,
      });
    }

    const userId = req.user?.id;

    if (
      team.createdBy._id.toString() !== userId &&
      !team.members.some((m) => m._id.toString() === userId)
    ) {
      return void res.status(403).json({
        message: "Forbidden: Access denied",
        data: null,
      });
    }

    return void res.status(200).json({
      message: "Team fetched successfully",
      data: { team },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const updateTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({
      message: "Invalid Team ID",
      data: null,
    });
  }

  try {
    const team = await Team.findById(id);
    if (!team) {
      return void res.status(404).json({
        message: "Team not found",
        data: null,
      });
    }

    if (team.createdBy.toString() !== req.user?.id) {
      return void res.status(403).json({
        message: "Forbidden: Only team creator can update this team",
        data: null,
      });
    }

    const { name, members } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim())
        return void res.status(400).json({
          message: "Team name must be a string",
          data: null,
        });
      team.name = name.trim();
    }

    if (members !== undefined) {
      if (
        !Array.isArray(members) ||
        !members.every(
          (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
        )
      )
        return void res.status(400).json({
          message: "Invalid members list",
          data: null,
        });
      team.members = members;
    }

    await team.save();

    const populatedTeam = await Team.findById(team.id)
      .populate("members", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(teamPublicFields)
      .lean();

    return void res.status(200).json({
      message: "Team updated successfully",
      data: { team: populatedTeam },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({
      message: "Invalid Team ID",
      data: null,
    });

  try {
    const team = await Team.findById(id);
    if (!team) {
      return void res.status(404).json({
        message: "Team not found",
        data: null,
      });
    }
    if (team.createdBy.toString() !== req.user?.id) {
      return void res.status(403).json({
        message: "Forbidden: Only team creator can delete this team",
        data: null,
      });
    }

    await team.deleteOne();

    return void res.status(200).json({
      message: "Team deleted successfully",
      data: null,
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

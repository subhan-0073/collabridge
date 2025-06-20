import { Request, Response } from "express";
import { Task, taskPublicFields } from "../models/task.model";
import { userPublicFields } from "../models/user.model";
import { projectPublicFields } from "../models/project.model";
import mongoose from "mongoose";

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      project,
      dueDate,
      assignedTo,
      status,
      priority,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return void res
        .status(400)
        .json({ message: "Task name is required and must be a valid string" });
    }

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return void res
        .status(400)
        .json({ message: "A valid Project ID is required" });
    }

    let validDueDate: Date | undefined = undefined;
    if (dueDate !== undefined) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime()))
        return void res.status(400).json({ message: "Invalid due date" });
      if (parsed.getTime() < Date.now())
        return void res
          .status(400)
          .json({ message: "Due date must be in the future" });
      validDueDate = parsed;
    }

    let validAssignedTo: mongoose.Types.ObjectId[] | undefined = undefined;
    if (assignedTo !== undefined) {
      if (
        !Array.isArray(assignedTo) ||
        !assignedTo.every(
          (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
        )
      )
        return void res
          .status(400)
          .json({ message: "Invalid assigned members list" });
      validAssignedTo = assignedTo;
    }

    const validStatus = ["todo", "in-progress", "done"];
    if (status !== undefined && !validStatus.includes(status)) {
      return void res.status(400).json({ message: "Invalid task status" });
    }

    const validPriority = ["low", "medium", "high"];
    if (priority !== undefined && !validPriority.includes(priority)) {
      return void res.status(400).json({ message: "Invalid task priority" });
    }

    const task = await Task.create({
      title,
      description:
        typeof description === "string" ? description.trim() : undefined,
      project,
      dueDate: validDueDate,
      assignedTo: validAssignedTo,
      status,
      createdBy: req.user?.id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    return void res
      .status(201)
      .json({ message: "Task created successfully", task: populatedTask });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const tasks = await Task.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    })
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    return void res.json({ task: tasks });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    const task = await Task.findById(id)
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    if (!task) {
      return void res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user?.id;
    if (
      task.createdBy._id.toString() !== userId &&
      !task.assignedTo?.some((aTo) => aTo._id.toString() === userId)
    ) {
      return void res.status(403).json({ message: "Access denied" });
    }

    return void res.json({ task: task });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return void res.status(404).json({ message: "Task not found" });
    }
    if (task.createdBy.toString() !== req.user?.id) {
      return void res.status(403).json({ message: "Forbidden: Not your task" });
    }

    const {
      title,
      description,
      project,
      dueDate,
      assignedTo,
      status,
      priority,
    } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim())
        return void res.status(400).json({
          message: "Task name is required and must be a valid string",
        });
      task.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string")
        return void res
          .status(400)
          .json({ message: "Description must be valid" });
      task.description = description;
    }

    if (project !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(project))
        return void res
          .status(400)
          .json({ message: "A valid Project ID is required" });
      task.project = project;
    }

    if (dueDate !== undefined) {
      let validDueDate: Date | undefined = undefined;
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime()))
        return void res.status(400).json({ message: "Invalid due date" });
      if (parsed.getTime() < Date.now())
        return void res
          .status(400)
          .json({ message: "Due date must be in the future" });

      validDueDate = parsed;
      task.dueDate = validDueDate;
    }

    if (assignedTo !== undefined) {
      let validAssignedTo: mongoose.Types.ObjectId[] | undefined = undefined;
      if (
        !Array.isArray(assignedTo) ||
        !assignedTo.every(
          (id) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
        )
      )
        return void res
          .status(400)
          .json({ message: "Invalid assigned members list" });

      validAssignedTo = assignedTo;
      task.assignedTo = validAssignedTo;
    }

    if (status !== undefined) {
      const validStatus = ["todo", "in-progress", "done"];
      if (!validStatus.includes(status))
        return void res.status(400).json({ message: "Invalid task status" });
      task.status = status;
    }

    if (priority !== undefined) {
      const validPriority = ["low", "medium", "high"];
      if (!validPriority.includes(priority))
        return void res.status(400).json({ message: "Invalid task priority" });
      task.priority = priority;
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    return void res
      .status(200)
      .json({ message: "Task updated", task: populatedTask });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return void res.status(404).json({ message: "Task not found" });
    }

    if (task.createdBy.toString() !== req.user?.id) {
      return void res.status(403).json({ message: "Forbidden: Not your task" });
    }

    await task.deleteOne();

    return void res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};

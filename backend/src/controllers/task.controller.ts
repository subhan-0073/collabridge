import { Request, Response } from "express";
import { Task } from "../models/task.model";
import mongoose from "mongoose";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, project, assignedTo, status } = req.body;

    if (!title || !project) {
      return void res
        .status(400)
        .json({ message: "Title and Project are required" });
    }

    const task = await new Task({
      title,
      description,
      project,
      assignedTo,
      status,
      createdBy: req.user?.id,
    }).save();

    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const tasks = await Task.find({
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    })
      .populate("project")
      .populate("assignedTo");

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTasksById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({ message: "Invalid Task ID" });
  }
  try {
    const task = await Task.findById(id);

    if (!task) {
      return void res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user?.id;
    if (
      task.createdBy.toString() !== userId &&
      !task.assignedTo?.map((id) => id.toString()).includes(userId)
    ) {
      return void res.status(403).json({ message: "Access denied" });
    }

    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Task ID" });
  try {
    const task = await Task.findById(id);

    if (!task) {
      return void res.status(404).json({ message: "Task not found" });
    }
    if (task.createdBy.toString() !== req.user?.id) {
      return void res.status(403).json({ message: "Forbidden: Not your task" });
    }

    const { title, description, status, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    const updatedTask = await task.save();

    res.status(200).json({ message: "Task updated", task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid Task ID" });
  try {
    const task = await Task.findById(id);

    if (!task) return void res.status(404).json({ message: "Task not found" });

    if (task.createdBy.toString() !== req.user?.id)
      return void res.status(403).json({ message: "Forbidden: Not your task" });

    await task.deleteOne();
    return void res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

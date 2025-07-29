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
      order,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return void res.status(400).json({
        message: "Task name is required and must be a valid string",
        data: null,
      });
    }

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return void res.status(400).json({
        message: "A valid Project ID is required",
        data: null,
      });
    }

    let validDueDate: Date | undefined = undefined;
    if (dueDate !== undefined) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime()))
        return void res.status(400).json({
          message: "Invalid due date",
          data: null,
        });
      if (parsed.getTime() < Date.now())
        return void res.status(400).json({
          message: "Due date must be in the future",
          data: null,
        });
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
        return void res.status(400).json({
          message: "Invalid assigned members list",
          data: null,
        });
      validAssignedTo = assignedTo;
    }

    const validStatus = ["todo", "in-progress", "done"];
    if (status !== undefined && !validStatus.includes(status)) {
      return void res.status(400).json({
        message: "Invalid task status",
        data: null,
      });
    }

    const validPriority = ["low", "medium", "high"];
    if (priority !== undefined && !validPriority.includes(priority)) {
      return void res.status(400).json({
        message: "Invalid task priority",
        data: null,
      });
    }

    const task = await Task.create({
      title,
      description:
        typeof description === "string" ? description.trim() : undefined,
      project,
      dueDate: validDueDate,
      assignedTo: validAssignedTo,
      status,
      priority,
      createdBy: req.user?.id,
      order: typeof order === "number" ? order : undefined,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    return void res.status(201).json({
      message: "Task created successfully",
      data: { task: populatedTask },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const userTeams = await mongoose
      .model("Team")
      .find({ members: userId })
      .select("_id")
      .lean();

    const userProjects = await mongoose
      .model("Project")
      .find({
        $or: [
          { members: userId },
          { team: { $in: userTeams.map((t) => t._id) } },
        ],
      })
      .select("_id")
      .lean();

    const accessibleProjectIds = userProjects.map((p) => p._id);

    const tasks = await Task.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
        { project: { $in: accessibleProjectIds } },
      ],
    })
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    return void res.status(200).json({
      message: "Tasks fetched successfully",
      data: { tasks },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({
      message: "Invalid Task ID",
      data: null,
    });
  }

  try {
    const task = await Task.findById(id)
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    if (!task) {
      return void res.status(404).json({
        message: "Task not found",
        data: null,
      });
    }

    const userId = req.user?.id;

    const isCreator = task.createdBy._id.toString() === userId;
    const isAssigned = task.assignedTo?.some(
      (aTo) => aTo._id.toString() === userId
    );

    if (isCreator || isAssigned) {
      return void res.status(200).json({
        message: "Task fetched successfully",
        data: { task },
      });
    }

    const populatedProject = task.project as any;
    if (populatedProject) {
      const isInProject = populatedProject?.members?.some(
        (member: any) => member._id.toString() === userId
      );

      if (isInProject) {
        return void res.status(200).json({
          message: "Task fetched successfully",
          data: { task },
        });
      }

      if (populatedProject?.team) {
        const team = await mongoose
          .model("Team")
          .findById(populatedProject.team._id)
          .select("members")
          .lean();

        const teamData = team as any;
        const isInTeam = teamData?.members?.some(
          (memberId: any) => memberId.toString() === userId
        );

        if (isInTeam) {
          return void res.status(200).json({
            message: "Task fetched successfully",
            data: { task },
          });
        }
      }
    }

    return void res.status(403).json({
      message: "Access denied",
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

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({
      message: "Invalid Task ID",
      data: null,
    });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return void res.status(404).json({
        message: "Task not found",
        data: null,
      });
    }

    const userId = req.user?.id;
    const isOwner = task.createdBy.toString() === userId;
    const isAssigned = task.assignedTo?.some(
      (aTo) => aTo.toString() === userId
    );

    if (!isOwner && !isAssigned) {
      return void res.status(403).json({
        message:
          "Forbidden: You can only update tasks you created or are assigned to",
        data: null,
      });
    }

    if (!isOwner && isAssigned) {
      const { status } = req.body;
      if (status === undefined) {
        return void res.status(403).json({
          message: "Forbidden: Assigned users can only update task status",
          data: null,
        });
      }

      const validStatus = ["todo", "in-progress", "done"];
      if (!validStatus.includes(status)) {
        return void res.status(400).json({
          message: "Invalid task status",
          data: null,
        });
      }

      task.status = status;
      await task.save();

      const populatedTask = await Task.findById(task._id)
        .populate("project", projectPublicFields)
        .populate("assignedTo", userPublicFields)
        .populate("createdBy", userPublicFields)
        .select(taskPublicFields)
        .lean();

      return void res.status(200).json({
        message: "Task status updated successfully",
        data: { task: populatedTask },
      });
    }

    const {
      title,
      description,
      project,
      dueDate,
      assignedTo,
      status,
      priority,
      order,
    } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim())
        return void res.status(400).json({
          message: "Task name is required and must be a valid string",
          data: null,
        });
      task.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return void res.status(400).json({
          message: "Description must be valid",
          data: null,
        });
      }
      task.description = description;
    }

    if (project !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(project))
        return void res.status(400).json({
          message: "A valid Project ID is required",
          data: null,
        });
      task.project = project;
    }

    if (dueDate !== undefined) {
      let validDueDate: Date | undefined = undefined;
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime()))
        return void res.status(400).json({
          message: "Invalid due date",
          data: null,
        });
      if (parsed.getTime() < Date.now())
        return void res.status(400).json({
          message: "Due date must be in the future",
          data: null,
        });

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
        return void res.status(400).json({
          message: "Invalid assigned members list",
          data: null,
        });

      validAssignedTo = assignedTo;
      task.assignedTo = validAssignedTo;
    }

    if (status !== undefined) {
      const validStatus = ["todo", "in-progress", "done"];
      if (!validStatus.includes(status))
        return void res.status(400).json({
          message: "Invalid task status",
          data: null,
        });
      task.status = status;
    }

    if (priority !== undefined) {
      const validPriority = ["low", "medium", "high"];
      if (!validPriority.includes(priority))
        return void res.status(400).json({
          message: "Invalid task priority",
          data: null,
        });
      task.priority = priority;
    }

    if (order !== undefined) {
      if (typeof order !== "number")
        return void res.status(400).json({
          message: "Order must be a number",
          data: null,
        });
      task.order = order;
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("project", projectPublicFields)
      .populate("assignedTo", userPublicFields)
      .populate("createdBy", userPublicFields)
      .select(taskPublicFields)
      .lean();

    return void res.status(200).json({
      message: "Task updated successfully",
      data: { task: populatedTask },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return void res.status(400).json({
      message: "Invalid Task ID",
      data: null,
    });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return void res.status(404).json({
        message: "Task not found",
        data: null,
      });
    }

    if (task.createdBy.toString() !== req.user?.id) {
      return void res.status(403).json({
        message: "Forbidden: You can only delete your own tasks",
        data: null,
      });
    }

    await task.deleteOne();

    return void res.status(200).json({
      message: "Task deleted successfully",
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

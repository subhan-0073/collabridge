import { Request, Response } from "express";
import { Comment, commentPublicFields } from "../models/comment.model";
import { Task } from "../models/task.model";
import { userPublicFields } from "../models/user.model";
import mongoose from "mongoose";

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return void res.status(400).json({
      message: "Invalid task ID",
      data: null,
    });

  if (typeof content !== "string" || !content.trim())
    return void res.status(400).json({
      message: "Comment content must be valid",
      data: null,
    });

  try {
    const task = await Task.findById(taskId).lean();
    if (!task)
      return void res.status(404).json({
        message: "Task not found",
        data: null,
      });

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user?.id,
      task: taskId,
    });

    await Task.findByIdAndUpdate(taskId, { $inc: { commentsCount: 1 } });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", userPublicFields)
      .select(commentPublicFields)
      .lean();

    return void res.status(201).json({
      message: "Comment added successfully",
      data: { comment: populatedComment },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const getCommentsForTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return void res.status(400).json({
      message: "Invalid task ID",
      data: null,
    });

  try {
    const task = await Task.findById(taskId).lean();
    if (!task)
      return void res.status(404).json({
        message: "Task not found",
        data: null,
      });

    const comments = await Comment.find({ task: taskId })
      .sort({ createdAt: -1 })
      .populate("author", userPublicFields)
      .select(commentPublicFields)
      .lean();

    return void res.status(200).json({
      message: "Comments fetched successfully",
      data: { comments },
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({
      message: "Invalid task ID",
      data: null,
    });

  try {
    const comment = await Comment.findById(id);
    if (!comment)
      return void res.status(404).json({
        message: "Comment not found",
        data: null,
      });

    if (comment.author.toString() !== req.user?.id)
      return void res.status(403).json({
        message: "Forbidden: You can only delete your own comments",
        data: null,
      });

    await Task.findByIdAndUpdate(comment.task, { $inc: { commentsCount: -1 } });
    await comment.deleteOne();

    return void res.status(200).json({
      message: "Comment deleted successfully",
      data: {},
    });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({
      message: "Server error",
      data: null,
    });
  }
};

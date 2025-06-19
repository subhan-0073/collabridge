import { Request, Response } from "express";
import mongoose from "mongoose";
import { Comment, commentPublicFields } from "../models/comment.model";
import { Task } from "../models/task.model";

export const createComment = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return void res.status(400).json({ message: "Invalid task ID" });

  if (typeof content !== "string" || !content.trim())
    return void res
      .status(400)
      .json({ message: "Comment content must be valid" });

  try {
    const task = await Task.findById(taskId).lean();
    if (!task) return void res.status(404).json({ message: "Task not found" });

    const newComment = await Comment.create({
      content: content.trim(),

      author: req.user?.id,
      task: taskId,
    });

    const populatedComment = await Comment.findById(newComment._id).populate(
      "author"
    );

    return void res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sevrer error" });
  }
};
export const getCommentsForTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId))
    return void res.status(400).json({ message: "Invalid task ID" });

  try {
    const task = await Task.findById(taskId).lean();

    if (!task) return void res.status(404).json({ message: "Task not found" });

    const comments = await Comment.find({ task: taskId })
      .sort({ createdAt: -1 })
      .populate("author")
      .select(commentPublicFields);

    return void res.status(200).json({ comments });
  } catch (err) {
    console.error(err);
    return void res.status(500).json({ message: "Server error" });
  }
};
export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return void res.status(400).json({ message: "Invalid comment ID" });

  try {
    const comment = await Comment.findById(id);

    if (!comment)
      return void res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user?.id)
      return void res
        .status(403)
        .json({ message: "Forbidden:You can only delete your own comments" });

    await Comment.deleteOne();
    return void res
      .status(200)
      .json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);

    return void res.status(500).json({ message: "Server error" });
  }
};

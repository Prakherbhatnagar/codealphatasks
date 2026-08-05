import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getIo } from '../config/socket.js';

export const createComment = async (req, res) => {
  try {
    const { taskId, content } = req.body;

    if (!taskId || !content) {
      return res.status(400).json({ message: 'Task ID and content are required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Detect @mentions in content e.g., @John
    const mentionRegex = /@([a-zA-Z0-9_\s]+?)(?=\s|$|[^a-zA-Z0-9_])/g;
    const mentionedNames = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedNames.push(match[1].trim());
    }

    let mentionedUserIds = [];
    if (mentionedNames.length > 0) {
      const foundUsers = await User.find({
        name: { $in: mentionedNames.map((n) => new RegExp(`^${n}$`, 'i')) }
      });
      mentionedUserIds = foundUsers.map((u) => u._id);
    }

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      content,
      mentions: mentionedUserIds
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar role')
      .populate('mentions', 'name email avatar role');

    // Send notifications to mentioned users
    for (const mentionedId of mentionedUserIds) {
      if (mentionedId.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          recipient: mentionedId,
          sender: req.user._id,
          type: 'new_comment',
          message: `${req.user.name} mentioned you in a comment on task "${task.title}"`,
          project: task.project,
          task: task._id
        });
        try {
          const io = getIo();
          io.to(`user:${mentionedId}`).emit('notification_received', notif);
        } catch (e) {}
      }
    }

    // Send notification to task assignee if not the commenter or mentioned
    if (
      task.assignedTo &&
      task.assignedTo.toString() !== req.user._id.toString() &&
      !mentionedUserIds.some((id) => id.toString() === task.assignedTo.toString())
    ) {
      const notif = await Notification.create({
        recipient: task.assignedTo,
        sender: req.user._id,
        type: 'new_comment',
        message: `${req.user.name} commented on your task "${task.title}"`,
        project: task.project,
        task: task._id
      });
      try {
        const io = getIo();
        io.to(`user:${task.assignedTo}`).emit('notification_received', notif);
      } catch (e) {}
    }

    // Broadcast to project room
    try {
      const io = getIo();
      io.to(`project:${task.project}`).emit('comment_added', {
        taskId,
        comment: populatedComment
      });
    } catch (e) {}

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email avatar role')
      .populate('mentions', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only author can delete comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';
import { getIo } from '../config/socket.js';

export const createTask = async (req, res) => {
  try {
    const { project, title, description, status, priority, assignedTo, dueDate, labels } = req.body;

    if (!project || !title) {
      return res.status(400).json({ message: 'Project ID and task title are required' });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get current task count in column to assign position
    const position = await Task.countDocuments({ project, status: status || 'To Do' });

    const task = await Task.create({
      project,
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate,
      labels: labels || [],
      position
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    // Notify assigned user if assigned
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        message: `You were assigned task "${task.title}" in ${projectDoc.title}`,
        project: project,
        task: task._id
      });
      try {
        const io = getIo();
        io.to(`user:${assignedTo}`).emit('notification_received', notif);
      } catch (e) {}
    }

    // Broadcast live event to project room
    try {
      const io = getIo();
      io.to(`project:${project}`).emit('task_created', populatedTask);
    } catch (e) {}

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId, assignedTo, status, priority, search } = req.query;
    let query = {};

    if (projectId) query.project = projectId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If no specific project, restrict to user's projects or assigned tasks
    if (!projectId && !assignedTo) {
      const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      query.project = { $in: projectIds };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .sort({ position: 1, createdAt: -1 });

    // Include comment counts
    const tasksWithCommentsCount = await Promise.all(
      tasks.map(async (task) => {
        const commentsCount = await Comment.countDocuments({ task: task._id });
        return {
          ...task.toObject(),
          commentsCount
        };
      })
    );

    res.json(tasksWithCommentsCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('project', 'title color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const commentsCount = await Comment.countDocuments({ task: task._id });

    res.json({
      ...task.toObject(),
      commentsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const previousAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    if (req.body.assignedTo !== undefined) task.assignedTo = req.body.assignedTo || null;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
    if (req.body.labels !== undefined) task.labels = req.body.labels;

    const updatedTask = await task.save();
    const populated = await Task.findById(updatedTask._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    const newAssignee = populated.assignedTo ? populated.assignedTo._id.toString() : null;

    // Send notification if new assignment
    if (newAssignee && newAssignee !== previousAssignee && newAssignee !== req.user._id.toString()) {
      const notif = await Notification.create({
        recipient: newAssignee,
        sender: req.user._id,
        type: 'task_assigned',
        message: `You were assigned task "${populated.title}"`,
        project: populated.project,
        task: populated._id
      });
      try {
        const io = getIo();
        io.to(`user:${newAssignee}`).emit('notification_received', notif);
      } catch (e) {}
    } else if (newAssignee && newAssignee !== req.user._id.toString()) {
      // General task updated notification
      const notif = await Notification.create({
        recipient: newAssignee,
        sender: req.user._id,
        type: 'task_updated',
        message: `Task "${populated.title}" was updated by ${req.user.name}`,
        project: populated.project,
        task: populated._id
      });
      try {
        const io = getIo();
        io.to(`user:${newAssignee}`).emit('notification_received', notif);
      } catch (e) {}
    }

    // Broadcast Socket.IO update
    try {
      const io = getIo();
      io.to(`project:${task.project}`).emit('task_updated', populated);
    } catch (e) {}

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moveTask = async (req, res) => {
  try {
    const { status, position } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status || task.status;
    if (position !== undefined) task.position = position;

    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    try {
      const io = getIo();
      io.to(`project:${task.project}`).emit('task_moved', populated);
    } catch (e) {}

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectId = task.project;
    const taskId = task._id;

    await Comment.deleteMany({ task: taskId });
    await task.deleteOne();

    try {
      const io = getIo();
      io.to(`project:${projectId}`).emit('task_deleted', taskId);
    } catch (e) {}

    res.json({ message: 'Task deleted successfully', taskId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    task.attachments.push(attachment);
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar role');

    try {
      const io = getIo();
      io.to(`project:${task.project}`).emit('task_updated', populated);
    } catch (e) {}

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

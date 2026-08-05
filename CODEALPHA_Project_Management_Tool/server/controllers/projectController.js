import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getIo } from '../config/socket.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, category, color, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      title,
      description,
      category: category || 'General',
      color: color || '#6366F1',
      dueDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Owner' }]
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    })
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    // Calculate progress for each project based on tasks
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: 'Completed'
        });
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress
        };
      })
    );

    res.json(projectsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check membership
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      status: 'Completed'
    });
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      ...project.toObject(),
      totalTasks,
      completedTasks,
      progress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can update settings' });
    }

    project.title = req.body.title || project.title;
    project.description = req.body.description !== undefined ? req.body.description : project.description;
    project.category = req.body.category || project.category;
    project.color = req.body.color || project.color;
    project.status = req.body.status || project.status;
    project.dueDate = req.body.dueDate || project.dueDate;

    const updatedProject = await project.save();
    const populated = await Project.findById(updatedProject._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can delete project' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and associated tasks removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push({ user: userId, role: role || 'Member' });
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    // Create notification
    const notification = await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'project_invite',
      message: `You were invited to project "${project.title}"`,
      project: project._id
    });

    try {
      const io = getIo();
      io.to(`user:${userId}`).emit('notification_received', notification);
      io.to(`project:${project._id}`).emit('project_updated', populatedProject);
    } catch (e) {
      // socket silent fallback
    }

    res.json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    res.json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Comment from './models/Comment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Database Connection & Seed Data function
const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seeding] Initializing demo data...');
      
      const admin = await User.create({
        name: 'Alex Morgan',
        email: 'alex@codealpha.io',
        password: 'password123',
        role: 'Project Manager',
        bio: 'Senior Product Lead at CodeAlpha',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });

      const dev = await User.create({
        name: 'Sarah Connor',
        email: 'sarah@codealpha.io',
        password: 'password123',
        role: 'Developer',
        bio: 'Full Stack Engineer focusing on React & Node.js',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      });

      const designer = await User.create({
        name: 'David Chen',
        email: 'david@codealpha.io',
        password: 'password123',
        role: 'Designer',
        bio: 'UI/UX Specialist crafting sleek interfaces',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      });

      // Seed Project 1
      const project1 = await Project.create({
        title: 'SaaS Platform Redesign v2',
        description: 'Modernizing core application UI with Tailwind CSS, dark mode support, and real-time WebSockets.',
        category: 'Engineering',
        color: '#6366F1',
        owner: admin._id,
        members: [
          { user: admin._id, role: 'Owner' },
          { user: dev._id, role: 'Admin' },
          { user: designer._id, role: 'Member' }
        ],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });

      // Seed Project 2
      const project2 = await Project.create({
        title: 'Mobile App API Integration',
        description: 'Developing high-performance REST APIs & JWT authentication for iOS & Android apps.',
        category: 'Product',
        color: '#3B82F6',
        owner: dev._id,
        members: [
          { user: dev._id, role: 'Owner' },
          { user: admin._id, role: 'Member' }
        ],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Seed Tasks for Project 1
      const task1 = await Task.create({
        project: project1._id,
        title: 'Design UI Mockups & Color System',
        description: 'Create high-fidelity dark/light mode mockups in Figma with modern indigo gradient theme.',
        status: 'Completed',
        priority: 'High',
        assignedTo: designer._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        labels: ['Design', 'UI/UX'],
        position: 0
      });

      const task2 = await Task.create({
        project: project1._id,
        title: 'Implement Kanban Board Drag and Drop',
        description: 'Integrate fluid column drag-and-drop support with real-time Socket.IO board updates.',
        status: 'In Progress',
        priority: 'Urgent',
        assignedTo: dev._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'React'],
        position: 0
      });

      const task3 = await Task.create({
        project: project1._id,
        title: 'Setup Express.js Authentication & JWT',
        description: 'Configure bcrypt password hashing, JWT middleware, and protected API routes.',
        status: 'Review',
        priority: 'Medium',
        assignedTo: dev._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'Security'],
        position: 0
      });

      const task4 = await Task.create({
        project: project1._id,
        title: 'Add Threaded Comments & Mentions',
        description: 'Allow users to comment on tasks with @mention support and instant notifications.',
        status: 'To Do',
        priority: 'Medium',
        assignedTo: admin._id,
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        labels: ['Feature', 'Collaboration'],
        position: 0
      });

      // Seed Comments
      await Comment.create({
        task: task2._id,
        user: admin._id,
        content: 'Great progress @Sarah Connor! Make sure to test socket reconnection on column drops.'
      });

      await Comment.create({
        task: task2._id,
        user: dev._id,
        content: 'Thanks Alex! Drag-and-drop state syncing is working seamlessly now.'
      });

      console.log('[Seeding] Demo data created successfully! Demo user: alex@codealpha.io / password123');
    }
  } catch (err) {
    console.error('[Seeding Error]', err.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  seedDemoData();
  server.listen(PORT, () => {
    console.log(`[Server] Express.js & Socket.IO server running on http://localhost:${PORT}`);
  });
});

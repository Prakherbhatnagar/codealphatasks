import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join specific user room for notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user room: user:${userId}`);
      }
    });

    // Join project room for live board updates
    socket.on('join_project', (projectId) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined project room: project:${projectId}`);
      }
    });

    // Leave project room
    socket.on('leave_project', (projectId) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left project room: project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

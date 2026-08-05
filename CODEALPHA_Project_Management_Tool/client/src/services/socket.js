import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // Connect directly to Express.js Socket.IO server on port 5000
    const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : window.location.origin;

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[Socket Client] Connected directly to server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket Client] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket Client] Connection error:', err.message);
    });
  }

  return socket;
};

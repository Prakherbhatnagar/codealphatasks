import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import API from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('[Notifications] Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const socket = getSocket();

      socket.emit('join_user', user._id);

      const handleNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        addToast(notif.message, 'info');
      };

      socket.on('notification_received', handleNotification);

      return () => {
        socket.off('notification_received', handleNotification);
      };
    }
  }, [user]);

  const markNotificationRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

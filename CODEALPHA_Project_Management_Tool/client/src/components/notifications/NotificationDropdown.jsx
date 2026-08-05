import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Bell, Check, CheckCheck, Clock, Layers, MessageSquare, UserPlus } from 'lucide-react';


export const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useSocket();

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'new_comment':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'project_invite':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      case 'due_reminder':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl glass-panel bg-slate-900 border border-slate-800 z-50 overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markNotificationRead(n._id)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                n.read ? 'hover:bg-slate-800/40 opacity-70' : 'bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/50 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 leading-snug">{n.message}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

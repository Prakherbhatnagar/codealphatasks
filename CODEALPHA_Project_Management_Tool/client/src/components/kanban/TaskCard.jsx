import React from 'react';
import { MessageSquare, Paperclip, Calendar, MoreVertical, Flag, Clock } from 'lucide-react';

export const TaskCard = ({ task, onClick, onDragStart, onEdit, onDelete }) => {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onClick={onClick}
      className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Priority & Category Labels */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 ${getPriorityStyle(
              task.priority
            )}`}
          >
            <Flag className="w-2.5 h-2.5" />
            {task.priority}
          </span>
          {task.labels &&
            task.labels.map((label, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded-md border border-slate-700/60"
              >
                {label}
              </span>
            ))}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Task Description Excerpt */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Due Date & Badges Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}

          {task.commentsCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.commentsCount}</span>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo ? (
          <img
            src={task.assignedTo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedTo.name}`}
            alt={task.assignedTo.name}
            title={`Assigned to ${task.assignedTo.name}`}
            className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
          />
        ) : (
          <div
            title="Unassigned"
            className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold"
          >
            ?
          </div>
        )}
      </div>
    </div>
  );
};

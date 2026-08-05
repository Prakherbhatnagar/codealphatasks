import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus, Circle, Clock, Eye, CheckCircle2 } from 'lucide-react';

export const KanbanColumn = ({
  status,
  tasks,
  onTaskClick,
  onAddTask,
  onTaskDrop
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const getColumnHeaderInfo = (status) => {
    switch (status) {
      case 'To Do':
        return {
          icon: Circle,
          color: 'text-slate-400',
          bg: 'bg-slate-800/80',
          border: 'border-slate-700/60'
        };
      case 'In Progress':
        return {
          icon: Clock,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30'
        };
      case 'Review':
        return {
          icon: Eye,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30'
        };
      case 'Completed':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30'
        };
      default:
        return {
          icon: Circle,
          color: 'text-slate-400',
          bg: 'bg-slate-800',
          border: 'border-slate-700'
        };
    }
  };

  const info = getColumnHeaderInfo(status);
  const Icon = info.icon;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskDrop(taskId, status);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-3xl bg-slate-900/60 border p-4 transition-all duration-200 min-h-[500px] ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20'
          : 'border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${info.bg} ${info.border} border`}>
            <Icon className={`w-4 h-4 ${info.color}`} />
          </div>
          <h3 className="font-bold text-sm text-slate-200 tracking-tight">{status}</h3>
          <span className="px-2 py-0.5 text-xs font-bold text-slate-400 bg-slate-800 rounded-full border border-slate-700/60">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(status)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Add task to ${status}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task Cards Stack */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={handleDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
            <span>No tasks in {status}</span>
            <button
              onClick={() => onAddTask(status)}
              className="text-indigo-400 hover:underline font-medium mt-1"
            >
              + Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

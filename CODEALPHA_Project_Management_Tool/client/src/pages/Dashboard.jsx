import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { TaskDetailModal } from '../components/task/TaskDetailModal';
import { TaskModal } from '../components/task/TaskModal';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Layers,
  Activity,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const { projects, tasks, selectProject } = useProject();
  const navigate = useNavigate();

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const myTasks = tasks.filter((t) => t.assignedTo?._id === user?._id || t.createdBy?._id === user?._id);
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');

  const overallProgress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" />
              SaaS Collaboration Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              You have <span className="text-indigo-400 font-semibold">{myTasks.length} assigned tasks</span> across {projects.length} active projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Manage Projects
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{projects.length}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">+100%</span> active team velocity
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress Tasks</span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{inProgressTasks.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            <span className="text-blue-400 font-semibold">{myTasks.length}</span> assigned to you
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{completedTasks.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            Out of <span className="text-slate-300 font-semibold">{tasks.length}</span> total tasks
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Progress</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{overallProgress}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Projects Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Recent Group Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project._id}
                onClick={() => {
                  selectProject(project._id);
                  navigate('/projects');
                }}
                className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 font-mono">
                    {project.progress || 0}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${project.progress || 0}%`,
                      backgroundColor: project.color || '#6366F1'
                    }}
                  />
                </div>

                {/* Members Avatars Stack */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex -space-x-2">
                    {project.members &&
                      project.members.slice(0, 4).map((m, idx) => (
                        <img
                          key={idx}
                          src={
                            m.user?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name}`
                          }
                          alt={m.user?.name}
                          className="w-6 h-6 rounded-full ring-2 ring-slate-900 object-cover"
                        />
                      ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {project.totalTasks || 0} tasks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Assigned Tasks Summary */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Assigned Tasks ({myTasks.length})</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View All
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 divide-y divide-slate-800/80">
            {myTasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No tasks assigned to you right now.</p>
            ) : (
              myTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className="py-3 px-2 flex items-start gap-3 hover:bg-slate-800/40 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="mt-0.5">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        task.status === 'Completed'
                          ? 'bg-emerald-500'
                          : task.status === 'In Progress'
                          ? 'bg-indigo-500'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate hover:text-indigo-400">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="font-medium text-slate-400">{task.status}</span>
                      {task.dueDate && (
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask._id}
          onClose={() => setSelectedTask(null)}
          onOpenEdit={(t) => setTaskToEdit(t)}
        />
      )}

      {/* Task Edit Modal */}
      {taskToEdit && (
        <TaskModal
          taskToEdit={taskToEdit}
          onClose={() => setTaskToEdit(null)}
        />
      )}
    </div>
  );
};

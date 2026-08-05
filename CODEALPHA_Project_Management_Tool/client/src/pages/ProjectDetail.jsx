import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskDetailModal } from '../components/task/TaskDetailModal';
import { TaskModal } from '../components/task/TaskModal';
import { ProjectModal } from '../components/project/ProjectModal';
import { InviteMemberModal } from '../components/project/InviteMemberModal';
import {
  FolderKanban,
  Kanban,
  ListFilter,
  Users,
  Settings,
  Plus,
  UserPlus,
  Trash2,
  Edit,
  Search,
  CheckCircle2
} from 'lucide-react';

export const ProjectDetail = () => {
  const { activeProject, projects, tasks, deleteProject } = useProject();

  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'list', 'members', 'settings'
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState('To Do');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  const [filterPriority, setFilterPriority] = useState('All');
  const [search, setSearch] = useState('');

  if (!activeProject && projects.length > 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
        <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-400" />
        <h3 className="text-base font-bold text-slate-200">No Active Project Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select a project from the top navbar or sidebar.</p>
      </div>
    );
  }

  if (!activeProject) return null;

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleAddTask = (status = 'To Do') => {
    setDefaultTaskStatus(status);
    setTaskToEdit(null);
    setShowTaskModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full shadow-md"
                style={{ backgroundColor: activeProject.color || '#6366F1' }}
              />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {activeProject.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                {activeProject.progress || 0}% Complete
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeProject.title}
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {activeProject.description || 'Collaborative Kanban board and task tracking.'}
            </p>
          </div>

          {/* Member Stack & Invite Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {activeProject.members &&
                activeProject.members.map((m, idx) => (
                  <img
                    key={idx}
                    src={m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name}`}
                    alt={m.user?.name}
                    title={`${m.user?.name} (${m.role})`}
                    className="w-8 h-8 rounded-full ring-2 ring-slate-900 object-cover"
                  />
                ))}
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
            <button
              onClick={() => handleAddTask('To Do')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Kanban Board
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              Task List ({filteredTasks.length})
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'members'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Team ({activeProject.members?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'kanban' && (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskClick={(t) => setSelectedTask(t)}
          onAddTask={handleAddTask}
        />
      )}

      {activeTab === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/80">
                <th className="py-3.5 px-6">Task Title</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredTasks.map((t) => (
                <tr
                  key={t._id}
                  onClick={() => setSelectedTask(t)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-6 font-semibold text-slate-200 hover:text-indigo-400">
                    {t.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={t.assignedTo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.assignedTo.name}`}
                          alt={t.assignedTo.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-slate-300">{t.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProject.members?.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name}`}
                  alt={m.user?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{m.user?.name}</h4>
                  <p className="text-xs text-slate-400">{m.user?.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-100">Project Settings</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setShowEditProjectModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit Project Info
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Delete this project and all its tasks?')) {
                  await deleteProject(activeProject._id);
                }
              }}
              className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Project
            </button>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask._id}
          onClose={() => setSelectedTask(null)}
          onOpenEdit={(t) => {
            setTaskToEdit(t);
            setShowTaskModal(true);
          }}
        />
      )}

      {/* Create / Edit Task Modal */}
      {showTaskModal && (
        <TaskModal
          taskToEdit={taskToEdit}
          defaultStatus={defaultTaskStatus}
          onClose={() => {
            setShowTaskModal(false);
            setTaskToEdit(null);
          }}
        />
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          projectId={activeProject._id}
          currentMembers={activeProject.members}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Edit Project Settings Modal */}
      {showEditProjectModal && (
        <ProjectModal
          projectToEdit={activeProject}
          onClose={() => setShowEditProjectModal(false)}
        />
      )}
    </div>
  );
};

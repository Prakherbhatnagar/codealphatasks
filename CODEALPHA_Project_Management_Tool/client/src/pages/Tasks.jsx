import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { TaskDetailModal } from '../components/task/TaskDetailModal';
import { TaskModal } from '../components/task/TaskModal';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Paperclip,
  Flag
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const Tasks = () => {
  const { user } = useAuth();
  const { tasks } = useProject();
  const [searchParams] = useSearchParams();
  
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All'); // 'All', 'Me'

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesAssignee =
      assignedFilter === 'All' || (assignedFilter === 'Me' && t.assignedTo?._id === user?._id);

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Global Tasks Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage, filter, and track task deliverables across all projects
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter tasks by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAssignedFilter(assignedFilter === 'Me' ? 'All' : 'Me')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              assignedFilter === 'Me'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Assigned to Me
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">Status: All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">Priority: All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-300">No Tasks Matching Criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/80">
                <th className="py-3.5 px-6">Task</th>
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
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 hover:text-indigo-400">
                        {t.title}
                      </h4>
                      {t.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {t.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={t.assignedTo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.assignedTo.name}`}
                          alt={t.assignedTo.name}
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500/30"
                        />
                        <span className="text-slate-300 font-medium">{t.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-medium">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask._id}
          onClose={() => setSelectedTask(null)}
          onOpenEdit={(t) => setTaskToEdit(t)}
        />
      )}

      {(showCreateModal || taskToEdit) && (
        <TaskModal
          taskToEdit={taskToEdit}
          onClose={() => {
            setShowCreateModal(false);
            setTaskToEdit(null);
          }}
        />
      )}
    </div>
  );
};

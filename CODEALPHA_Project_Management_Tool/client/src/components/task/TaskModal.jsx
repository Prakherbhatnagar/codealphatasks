import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Calendar, Flag, User, Tag, Plus, Check } from 'lucide-react';
import API from '../../services/api';

export const TaskModal = ({ taskToEdit = null, defaultStatus = 'To Do', onClose }) => {
  const { activeProject, projects, createTask, updateTask } = useProject();
  
  const [projectId, setProjectId] = useState(activeProject?._id || (projects[0] ? projects[0]._id : ''));
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [status, setStatus] = useState(taskToEdit?.status || defaultStatus);
  const [priority, setPriority] = useState(taskToEdit?.priority || 'Medium');
  const [assignedTo, setAssignedTo] = useState(taskToEdit?.assignedTo?._id || '');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState(taskToEdit?.labels || []);
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setSubmitting(true);
    try {
      const payload = {
        project: projectId,
        title,
        description,
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
        labels
      };

      if (taskToEdit) {
        await updateTask(taskToEdit._id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Project Selector (if creating) */}
          {!taskToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Implement Responsive Sidebar Navigation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add detailed task instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Assignee
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role || 'Member'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Labels / Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag (e.g. Frontend, Bug)"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLabel();
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((lbl, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 border border-slate-700 text-indigo-400 rounded-lg flex items-center gap-1.5"
                >
                  {lbl}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(lbl)}
                    className="hover:text-rose-400"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
            >
              {submitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

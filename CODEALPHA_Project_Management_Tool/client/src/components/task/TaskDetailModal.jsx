import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import API from '../../services/api';
import {
  X,
  Calendar,
  Flag,
  User,
  MessageSquare,
  Paperclip,
  Trash2,
  Edit2,
  Send,
  Upload,
  CheckCircle,
  FileText,
  Clock
} from 'lucide-react';

export const TaskDetailModal = ({ taskId, onClose, onOpenEdit }) => {
  const { user } = useAuth();
  const { updateTask, deleteTask } = useProject();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/tasks/${taskId}`);
        setTask(res.data);

        const commentsRes = await API.get(`/comments/task/${taskId}`);
        setComments(commentsRes.data);

        const usersRes = await API.get('/auth/users');
        setUsers(usersRes.data);
      } catch (err) {
        console.error('[Task Detail] Error fetching task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  // Real-time comment updates via Socket.IO
  useEffect(() => {
    if (!task) return;

    const socket = getSocket();
    const handleCommentAdded = (data) => {
      if (data.taskId === task._id) {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.comment._id)) return prev;
          return [...prev, data.comment];
        });
      }
    };

    socket.on('comment_added', handleCommentAdded);
    return () => {
      socket.off('comment_added', handleCommentAdded);
    };
  }, [task]);

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await updateTask(task._id, { status: newStatus });
      setTask((prev) => ({ ...prev, status: updated.status }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await updateTask(task._id, { priority: newPriority });
      setTask((prev) => ({ ...prev, priority: updated.priority }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssigneeChange = async (newAssignee) => {
    try {
      const updated = await updateTask(task._id, { assignedTo: newAssignee || null });
      setTask((prev) => ({ ...prev, assignedTo: updated.assignedTo }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
        onClose();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await API.post('/comments', {
        taskId: task._id,
        content: newComment
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await API.post(`/tasks/${task._id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTask(res.data);
    } catch (err) {
      console.error('[Upload Error]', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: task.project?.color || '#6366F1' }}
            />
            <span className="text-xs font-semibold text-slate-400">
              {task.project?.title || 'Project Task'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(task);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDeleteTask}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Description, Attachments, Comments */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">{task.title}</h2>
              <div className="p-4 bg-slate-800/60 border border-slate-800 rounded-2xl text-sm text-slate-300 leading-relaxed min-h-[80px] whitespace-pre-wrap">
                {task.description || 'No detailed description provided for this task.'}
              </div>
            </div>

            {/* Attachments Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-indigo-400" />
                  Attachments ({task.attachments ? task.attachments.length : 0})
                </h3>
                <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Attach File'}
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-2">
                {task.attachments && task.attachments.length > 0 ? (
                  task.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{file.originalName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <a
                        href={file.path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-400 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No file attachments uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Threaded Comments Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Activity & Comments ({comments.length})
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Write a comment... (use @Name to mention team members)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full pl-3.5 pr-12 py-2.5 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="absolute right-2.5 bottom-3.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs transition-colors disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Comments Feed */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-start gap-3"
                  >
                    <img
                      src={comment.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name}`}
                      alt={comment.user?.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {comment.user?.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {comment.user?._id === user?._id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Properties Sidebar */}
          <div className="space-y-5 bg-slate-950/50 p-4 border border-slate-800 rounded-2xl h-fit">
            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={task.assignedTo?._id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'No due date set'}
                </span>
              </div>
            </div>

            {/* Created By */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 block">Created by</span>
              <span className="text-xs font-semibold text-slate-300">
                {task.createdBy?.name || 'Unknown'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

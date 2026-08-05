import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { X, UserPlus, Shield } from 'lucide-react';

export const InviteMemberModal = ({ projectId, currentMembers = [], onClose, onMemberAdded }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/auth/users');
        // Filter out users already in project
        const memberUserIds = currentMembers.map((m) => m.user._id || m.user);
        const eligible = res.data.filter((u) => !memberUserIds.includes(u._id));
        setUsers(eligible);
        if (eligible.length > 0) {
          setSelectedUserId(eligible[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [currentMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    try {
      const res = await API.post(`/projects/${projectId}/members`, {
        userId: selectedUserId,
        role
      });
      if (onMemberAdded) onMemberAdded(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Invite Team Member</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              All registered organization users are already members of this project.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Select Member *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Project Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Admin">Admin (Can edit settings & manage tasks)</option>
                  <option value="Member">Member (Can create & update tasks)</option>
                  <option value="Viewer">Viewer (Read-only access)</option>
                </select>
              </div>

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
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  {loading ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, Mail, Shield, UserPlus, Search } from 'lucide-react';

export const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await API.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Organization Team</h1>
          <p className="text-xs text-slate-400 mt-1">
            View team members, roles, and project allocations
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-100">{user.name}</h3>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 inline-block mt-1">
                    {user.role || 'Member'}
                  </span>
                </div>
              </div>

              {user.bio && (
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {user.bio}
                </p>
              )}

              <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Active Organization Member
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

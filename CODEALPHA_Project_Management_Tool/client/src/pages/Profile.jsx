import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Save, Sun, Moon, Check } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'Member');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const payload = { name, role, bio };
      if (password.trim()) payload.password = password;
      await updateProfile(payload);
      setSaved(true);
      setPassword('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Profile Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* User Banner Card */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-800 mb-6">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <span className="mt-2 inline-block px-3 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
              {user?.role || 'Member'}
            </span>
          </div>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4" /> Profile settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Role / Position
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Project Manager">Project Manager</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Member">Member</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Bio / About Me
            </label>
            <textarea
              rows={3}
              placeholder="Tell your team about your expertise..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Theme Preference Toggle */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Interface Theme</h4>
              <p className="text-xs text-slate-400">Switch between Dark and Light SaaS theme mode</p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> Dark Mode Active
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" /> Light Mode Active
                </>
              )}
            </button>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

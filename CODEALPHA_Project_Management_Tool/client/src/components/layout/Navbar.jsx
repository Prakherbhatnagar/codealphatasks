import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { useProject } from '../../context/ProjectContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import {
  Bell,
  Sun,
  Moon,
  Search,
  User as UserIcon,
  LogOut,
  ChevronDown,
  FolderKanban,
  Plus,
  Menu
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar = ({ onOpenMobileSidebar, onOpenProjectModal }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useSocket();
  const { projects, activeProject, selectProject } = useProject();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const projRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (projRef.current && !projRef.current.contains(event.target)) {
        setShowProjectSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative" ref={projRef}>
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 text-sm font-medium text-slate-200 transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeProject?.color || '#6366F1' }}
            />
            <span className="max-w-[150px] sm:max-w-[200px] truncate">
              {activeProject ? activeProject.title : 'All Projects'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProjectSelector && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl shadow-2xl glass-panel bg-slate-900 border border-slate-800 py-2 z-50 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Switch Project
              </div>
              <button
                onClick={() => {
                  selectProject(null);
                  setShowProjectSelector(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-800 ${
                  !activeProject ? 'text-indigo-400 font-semibold' : 'text-slate-300'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                All Projects / Overview
              </button>

              <div className="my-1 border-t border-slate-800" />

              <div className="max-h-48 overflow-y-auto">
                {projects.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      selectProject(p._id);
                      setShowProjectSelector(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-800 ${
                      activeProject?._id === p._id ? 'text-indigo-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="truncate">{p.title}</span>
                    </div>
                    {p.progress !== undefined && (
                      <span className="text-xs text-slate-500 font-mono">{p.progress}%</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="my-1 border-t border-slate-800" />

              <button
                onClick={() => {
                  setShowProjectSelector(false);
                  onOpenProjectModal();
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, or press Enter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-1.5 text-sm bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition-all"
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative ml-1" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40"
            />
            <span className="hidden sm:block text-xs font-semibold text-slate-200 max-w-[100px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl glass-panel bg-slate-900 border border-slate-800 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
                  {user?.role || 'Member'}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

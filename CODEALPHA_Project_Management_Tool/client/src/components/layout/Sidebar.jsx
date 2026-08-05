import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  User,
  Plus,
  Zap,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ onOpenProjectModal, isMobile = false, onCloseMobile }) => {
  const { projects, activeProject, selectProject } = useProject();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const handleLinkClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 flex-shrink-0 transition-all duration-200 select-none ${
        isMobile ? 'w-full' : ''
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              TaskPulse
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-500/20 text-indigo-400 rounded-md border border-indigo-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Project Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Projects Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Projects ({projects.length})
            </p>
            <button
              onClick={() => {
                onOpenProjectModal();
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Create Project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {projects.map((project) => {
              const isSelected = activeProject?._id === project._id;
              return (
                <button
                  key={project._id}
                  onClick={() => {
                    selectProject(project._id);
                    handleLinkClick();
                  }}
                  className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-indigo-400 font-semibold border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color || '#6366F1' }}
                    />
                    <span className="truncate">{project.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

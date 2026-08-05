import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ProjectModal } from '../components/project/ProjectModal';
import { InviteMemberModal } from '../components/project/InviteMemberModal';
import {
  FolderKanban,
  Plus,
  Search,
  Grid,
  List as ListIcon,
  UserPlus,
  Calendar,
  Users,
  MoreVertical,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Projects = () => {
  const { projects, selectProject, deleteProject } = useProject();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [inviteModalProject, setInviteModalProject] = useState(null);

  const categories = ['All', 'Engineering', 'Design', 'Marketing', 'Product', 'General'];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Group Projects</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize teams, assign tasks, and track Kanban milestone progress
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid / List View */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-300">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first group project or adjusting your search filter.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            + Create Project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: project.color || '#6366F1' }}
                    />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {project.category}
                    </span>
                  </div>

                  <button
                    onClick={() => setInviteModalProject(project)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Invite Member"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3
                  onClick={() => {
                    selectProject(project._id);
                    navigate('/projects');
                  }}
                  className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors cursor-pointer mb-2"
                >
                  {project.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>Progress</span>
                    <span className="font-bold text-slate-200">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.progress || 0}%`,
                        backgroundColor: project.color || '#6366F1'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members &&
                    project.members.slice(0, 5).map((m, idx) => (
                      <img
                        key={idx}
                        src={
                          m.user?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name}`
                        }
                        alt={m.user?.name}
                        title={`${m.user?.name} (${m.role})`}
                        className="w-7 h-7 rounded-full ring-2 ring-slate-900 object-cover"
                      />
                    ))}
                </div>

                <button
                  onClick={() => {
                    selectProject(project._id);
                    navigate('/projects');
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-xs font-semibold text-indigo-400 rounded-xl transition-all"
                >
                  Open Board →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View Table */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/80">
                <th className="py-3.5 px-6">Project Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">Members</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredProjects.map((project) => (
                <tr key={project._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <div>
                        <h4
                          onClick={() => {
                            selectProject(project._id);
                            navigate('/projects');
                          }}
                          className="font-bold text-slate-200 hover:text-indigo-400 cursor-pointer"
                        >
                          {project.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{project.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-400">{project.category}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${project.progress || 0}%`,
                            backgroundColor: project.color || '#6366F1'
                          }}
                        />
                      </div>
                      <span className="font-mono text-slate-400">{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex -space-x-2">
                      {project.members &&
                        project.members.slice(0, 4).map((m, idx) => (
                          <img
                            key={idx}
                            src={m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name}`}
                            alt={m.user?.name}
                            className="w-6 h-6 rounded-full ring-2 ring-slate-900 object-cover"
                          />
                        ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        selectProject(project._id);
                        navigate('/projects');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
                    >
                      View Board
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ProjectModal onClose={() => setShowCreateModal(false)} />
      )}

      {inviteModalProject && (
        <InviteMemberModal
          projectId={inviteModalProject._id}
          currentMembers={inviteModalProject.members}
          onClose={() => setInviteModalProject(null)}
        />
      )}
    </div>
  );
};

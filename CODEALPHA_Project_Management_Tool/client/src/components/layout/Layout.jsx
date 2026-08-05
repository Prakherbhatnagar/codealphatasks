import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '../notifications/ToastContainer';
import { ProjectModal } from '../project/ProjectModal';
import { TaskModal } from '../task/TaskModal';
import { X } from 'lucide-react';

export const Layout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onOpenProjectModal={() => setProjectModalOpen(true)} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 shadow-2xl flex flex-col z-50">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              isMobile
              onCloseMobile={() => setMobileSidebarOpen(false)}
              onOpenProjectModal={() => {
                setMobileSidebarOpen(false);
                setProjectModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenProjectModal={() => setProjectModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Global Project Creation Modal */}
      {projectModalOpen && (
        <ProjectModal onClose={() => setProjectModalOpen(false)} />
      )}

      {/* Global Task Creation Modal */}
      {taskModalOpen && (
        <TaskModal onClose={() => setTaskModalOpen(false)} />
      )}
    </div>
  );
};

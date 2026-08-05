import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingProjects(true);
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('[Projects] Failed to fetch projects', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  const fetchTasks = useCallback(async (projectId = null) => {
    if (!user) return;
    try {
      setLoadingTasks(true);
      const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
      const res = await API.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error('[Tasks] Failed to fetch tasks', err);
    } finally {
      setLoadingTasks(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Handle Socket.IO room subscriptions & real-time board sync
  useEffect(() => {
    if (!user || !activeProject) return;

    const socket = getSocket();
    const projectId = activeProject._id;

    socket.emit('join_project', projectId);

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === newTask._id)) return prev;
        return [...prev, newTask];
      });
      fetchProjects(); // refresh progress
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t))
      );
      fetchProjects();
    };

    const handleTaskMoved = (movedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === movedTask._id ? { ...t, ...movedTask } : t))
      );
      fetchProjects();
    };

    const handleTaskDeleted = (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      fetchProjects();
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_moved', handleTaskMoved);
    socket.on('task_deleted', handleTaskDeleted);

    return () => {
      socket.emit('leave_project', projectId);
      socket.off('task_created', handleTaskCreated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_moved', handleTaskMoved);
      socket.off('task_deleted', handleTaskDeleted);
    };
  }, [user, activeProject, fetchProjects]);

  const selectProject = async (projectId) => {
    if (!projectId) {
      setActiveProject(null);
      fetchTasks();
      return;
    }
    try {
      const res = await API.get(`/projects/${projectId}`);
      setActiveProject(res.data);
      fetchTasks(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  const createProject = async (data) => {
    const res = await API.post('/projects', data);
    setProjects((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateProject = async (id, data) => {
    const res = await API.put(`/projects/${id}`, data);
    setProjects((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    if (activeProject && activeProject._id === id) {
      setActiveProject(res.data);
    }
    return res.data;
  };

  const deleteProject = async (id) => {
    await API.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    if (activeProject && activeProject._id === id) {
      setActiveProject(null);
    }
  };

  const createTask = async (data) => {
    const res = await API.post('/tasks', data);
    setTasks((prev) => [...prev, res.data]);
    fetchProjects();
    return res.data;
  };

  const updateTask = async (id, data) => {
    const res = await API.put(`/tasks/${id}`, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    fetchProjects();
    return res.data;
  };

  const moveTask = async (id, status, position) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status, position } : t))
    );
    try {
      const res = await API.patch(`/tasks/${id}/move`, { status, position });
      return res.data;
    } catch (err) {
      fetchTasks(activeProject ? activeProject._id : null);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    fetchProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        tasks,
        loadingProjects,
        loadingTasks,
        fetchProjects,
        fetchTasks,
        selectProject,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        moveTask,
        deleteTask
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);

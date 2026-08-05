import React from 'react';
import { KanbanColumn } from './KanbanColumn';
import { useProject } from '../../context/ProjectContext';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Completed'];

export const KanbanBoard = ({ tasks, onTaskClick, onAddTask }) => {
  const { moveTask } = useProject();

  const handleTaskDrop = async (taskId, targetStatus) => {
    try {
      // Find current position in target column
      const targetColumnTasks = tasks.filter((t) => t.status === targetStatus);
      const position = targetColumnTasks.length;
      await moveTask(taskId, targetStatus, position);
    } catch (err) {
      console.error('[Kanban] Failed to move task:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {COLUMNS.map((columnStatus) => {
        const columnTasks = tasks.filter((t) => t.status === columnStatus);
        return (
          <KanbanColumn
            key={columnStatus}
            status={columnStatus}
            tasks={columnTasks}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
            onTaskDrop={handleTaskDrop}
          />
        );
      })}
    </div>
  );
};

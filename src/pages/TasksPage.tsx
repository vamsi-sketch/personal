import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  PowerOff,
  Power,
  Trash2,
  Calendar,
  Tag,
  CheckSquare,
  Search,
  Filter
} from 'lucide-react';
import { Task } from '../types';
import { EmptyState } from '../components/EmptyState';

interface TasksPageProps {
  tasks: Task[];
  completions: Record<string, Record<string, boolean>>;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onToggleTaskActive: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  completions,
  onOpenAddTask,
  onEditTask,
  onToggleTaskActive,
  onDeleteTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return t.active;
    if (statusFilter === 'inactive') return !t.active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Task Management
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage your tracked habits and activities. Deactivating preserves historical data.
          </p>
        </div>
        <button
          onClick={onOpenAddTask}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      {tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search tasks or categories..."
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
            {(['all', 'active', 'inactive'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task List or Empty State */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks created yet"
          description="Create your first task to begin tracking consistency across days and weeks."
          actionLabel="Add First Task"
          onAction={onOpenAddTask}
        />
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center text-stone-500 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          No tasks match your search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => {
            const taskCompletions = completions[task.id] || {};
            const totalCompletedDays = Object.values(taskCompletions).filter(Boolean).length;

            return (
              <div
                key={task.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  task.active
                    ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
                    : 'bg-stone-50/60 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/60 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100 line-clamp-1">
                      {task.name}
                    </h3>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 ${
                        task.active
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {task.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">
                      {task.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-stone-400" />
                      <span>{task.category || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>Started: {task.start_date}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      {totalCompletedDays}
                    </span>{' '}
                    <span className="text-stone-400">total days logged</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                      className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleTaskActive(task)}
                      title={task.active ? 'Deactivate task' : 'Activate task'}
                      className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
                    >
                      {task.active ? (
                        <PowerOff className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Power className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete task"
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

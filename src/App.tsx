/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { StreaksPage } from './pages/StreaksPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddTaskModal } from './components/AddTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { Task, AnalyticsData, StreaksData } from './types';
import { api } from './services/api';
import { calculateAnalytics, calculateStreaks } from './utils/consistencyCalculator';
import { formatYearMonth } from './utils/dateUtils';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  
  // Date state: initialized to current date
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(now.getMonth());

  // Data state: starts completely empty with NO SAMPLE DATA
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Record<string, Record<string, boolean>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const monthStr = formatYearMonth(selectedYear, selectedMonthIndex);
      const calendarData = await api.getCalendar(monthStr);
      setTasks(calendarData.tasks || []);
      setCompletions(calendarData.completions || {});
    } catch (err) {
      console.error('Error loading tracker data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonthIndex]);

  // Handle Month Navigation
  const handleNavigateMonth = (year: number, monthIndex: number) => {
    setSelectedYear(year);
    setSelectedMonthIndex(monthIndex);
  };

  // Handle Toggle Checkbox Completion
  const handleToggleCompletion = async (taskId: string, dateStr: string) => {
    const currentTaskCompletions = completions[taskId] || {};
    const nextVal = !currentTaskCompletions[dateStr];

    // Optimistic UI update
    setCompletions(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [dateStr]: nextVal,
      },
    }));

    try {
      await api.setCompletion(taskId, dateStr, nextVal);
    } catch (err) {
      console.error('Failed to update completion on API', err);
      // Revert if API fails
      setCompletions(prev => ({
        ...prev,
        [taskId]: {
          ...(prev[taskId] || {}),
          [dateStr]: !nextVal,
        },
      }));
    }
  };

  // Handle Task Creation
  const handleCreateTask = async (data: {
    name: string;
    category?: string;
    description?: string;
    start_date: string;
  }) => {
    try {
      const newTask = await api.createTask(data);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  // Handle Task Editing
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await api.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  // Handle Task Deactivation / Activation (Preserves historical completion data)
  const handleToggleTaskActive = async (task: Task) => {
    try {
      const updated = task.active
        ? await api.deactivateTask(task.id)
        : await api.updateTask(task.id, { active: true });
      setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task active state', err);
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId: string) => {
    // Optimistic UI update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setCompletions(prev => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });

    try {
      await api.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task', err);
      // Reload on error
      loadData();
    }
  };

  // Handle Complete Data Reset
  const handleResetData = async () => {
    await api.resetData();
    setTasks([]);
    setCompletions({});
  };

  // Dynamic calculations for current view
  const analytics: AnalyticsData = calculateAnalytics(
    tasks,
    completions,
    selectedYear,
    selectedMonthIndex
  );

  const streaks: StreaksData = calculateStreaks(tasks, completions);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={page => setActivePage(page)}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activePage === 'dashboard' && (
          <DashboardPage
            tasks={tasks}
            completions={completions}
            analytics={analytics}
            selectedYear={selectedYear}
            selectedMonthIndex={selectedMonthIndex}
            onNavigateMonth={handleNavigateMonth}
            onToggleCompletion={handleToggleCompletion}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onEditTask={task => setEditingTask(task)}
            onToggleTaskActive={handleToggleTaskActive}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activePage === 'calendar' && (
          <CalendarPage
            tasks={tasks}
            completions={completions}
            selectedYear={selectedYear}
            selectedMonthIndex={selectedMonthIndex}
            onNavigateMonth={handleNavigateMonth}
            onToggleCompletion={handleToggleCompletion}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onEditTask={task => setEditingTask(task)}
            onToggleTaskActive={handleToggleTaskActive}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activePage === 'tasks' && (
          <TasksPage
            tasks={tasks}
            completions={completions}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onEditTask={task => setEditingTask(task)}
            onToggleTaskActive={handleToggleTaskActive}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage
            analytics={analytics}
            tasks={tasks}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
          />
        )}

        {activePage === 'streaks' && (
          <StreaksPage
            streaks={streaks}
            tasks={tasks}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
          />
        )}

        {activePage === 'settings' && (
          <SettingsPage
            tasks={tasks}
            completions={completions}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400 gap-2">
          <span>Personal Consistency Tracker · Private Single-User</span>
          <span>Zero sample data · True mathematically tracked consistency</span>
        </div>
      </footer>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleCreateTask}
      />

      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
      />
    </div>
  );
}

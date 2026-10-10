import { Task, AnalyticsData, StreaksData, MonthlyCalendarData, TaskConsistencyStat } from '../types';
import { getDaysInMonth, parseYearMonth } from '../utils/dateUtils';
import { calculateAnalytics, calculateStreaks } from '../utils/consistencyCalculator';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// In Phase 1, we start completely empty. We store in memory / localStorage fallback if backend is not up yet.
const STORAGE_KEY_TASKS = 'pct_tasks_v1';
const STORAGE_KEY_COMPLETIONS = 'pct_completions_v1';

function getLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks locally', err);
  }
}

function getLocalCompletions(): Record<string, Record<string, boolean>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETIONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalCompletions(completions: Record<string, Record<string, boolean>>) {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(completions));
  } catch (err) {
    console.error('Failed to save completions locally', err);
  }
}

export const api = {
  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running yet (Phase 1)
    }
    return getLocalTasks();
  },

  async createTask(data: { name: string; category?: string; description?: string; start_date: string }): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running yet (Phase 1)
    }

    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: data.name.trim(),
      category: data.category?.trim() || 'General',
      description: data.description?.trim() || '',
      start_date: data.start_date,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = getLocalTasks();
    const updated = [...current, newTask];
    saveLocalTasks(updated);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    const updatedTask = {
      ...tasks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    tasks[index] = updatedTask;
    saveLocalTasks(tasks);
    return updatedTask;
  },

  async deactivateTask(id: string): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/deactivate`, {
        method: 'PATCH',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return this.updateTask(id, { active: false });
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks().filter(t => t.id !== id);
    saveLocalTasks(tasks);
    return { success: true };
  },

  // Completions
  async getCompletions(taskId: string): Promise<Record<string, boolean>> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/completions`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return getLocalCompletions()[taskId] || {};
  },

  async setCompletion(taskId: string, date: string, completed: boolean): Promise<{ success: boolean; taskId: string; date: string; completed: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/completions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completionDate: date, completed }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const all = getLocalCompletions();
    if (!all[taskId]) all[taskId] = {};
    all[taskId][date] = completed;
    saveLocalCompletions(all);
    return { success: true, taskId, date, completed };
  },

  // Calendar
  async getCalendar(monthStr: string): Promise<MonthlyCalendarData> {
    try {
      const res = await fetch(`${API_BASE}/calendar?month=${encodeURIComponent(monthStr)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const { year, monthIndex } = parseYearMonth(monthStr);
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const tasks = getLocalTasks();
    const completions = getLocalCompletions();

    return {
      month: monthStr,
      year,
      monthIndex,
      daysInMonth,
      tasks,
      completions,
    };
  },

  // Analytics
  async getAnalytics(year?: number, monthIndex?: number): Promise<AnalyticsData> {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const tasks = getLocalTasks();
    const completions = getLocalCompletions();
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = monthIndex ?? now.getMonth();
    return calculateAnalytics(tasks, completions, y, m);
  },

  async getTaskAnalytics(): Promise<TaskConsistencyStat[]> {
    try {
      const res = await fetch(`${API_BASE}/analytics/tasks`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const analytics = await this.getAnalytics();
    return analytics.taskConsistency;
  },

  async getStreaks(): Promise<StreaksData> {
    try {
      const res = await fetch(`${API_BASE}/streaks`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const tasks = getLocalTasks();
    const completions = getLocalCompletions();
    return calculateStreaks(tasks, completions);
  },

  // Utility to clear data (useful for settings / testing)
  async resetData(): Promise<void> {
    try {
      await fetch(`${API_BASE}/reset`, { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY_TASKS);
    localStorage.removeItem(STORAGE_KEY_COMPLETIONS);
  }
};

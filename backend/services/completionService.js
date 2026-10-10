import { db } from '../database/db.js';
import { parseYearMonth, getDaysInMonth } from '../utils/dateHelper.js';

export const completionService = {
  async getCompletionsForTask(taskId) {
    const records = await db.getCompletions(taskId);
    const map = {};
    for (const rec of records) {
      map[rec.completion_date] = rec.completed;
    }
    return map;
  },

  async getCompletions(month = null, taskId = null) {
    return await db.getCompletions(taskId, month);
  },

  async setCompletion(taskId, dateStr, completed) {
    const task = await db.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    // Validation for date
    if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    const record = await db.upsertCompletion({
      task_id: taskId,
      completion_date: dateStr,
      completed: Boolean(completed),
    });

    return {
      success: true,
      taskId,
      date: dateStr,
      completed: record.completed,
      id: record.id,
    };
  },

  async getCalendarData(monthStr) {
    const { year, monthIndex } = parseYearMonth(monthStr);
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const tasks = await db.getAllTasks();
    const completions = await db.getCompletionsMap();

    return {
      month: monthStr,
      year,
      monthIndex,
      daysInMonth,
      tasks,
      completions,
    };
  },
};

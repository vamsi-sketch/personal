import { db } from '../database/db.js';
import { computeConsistencyAndAnalytics, computeStreaks } from '../utils/consistencyCalculations.js';

export const analyticsService = {
  async getFullAnalytics(year, monthIndex) {
    const tasks = await db.getAllTasks();
    const completionsMap = await db.getCompletionsMap();
    return computeConsistencyAndAnalytics(tasks, completionsMap, year, monthIndex);
  },

  async getTaskConsistency() {
    const analytics = await this.getFullAnalytics();
    return analytics.taskConsistency;
  },

  async getStreaks() {
    const tasks = await db.getAllTasks();
    const completionsMap = await db.getCompletionsMap();
    return computeStreaks(tasks, completionsMap);
  },
};

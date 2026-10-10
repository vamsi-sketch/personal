import { analyticsService } from '../services/analyticsService.js';
import { db } from '../database/db.js';

export const analyticsController = {
  async getAnalytics(req, res, next) {
    try {
      let year, monthIndex;
      if (req.query.month && req.query.month.includes('-')) {
        const [yStr, mStr] = req.query.month.split('-');
        year = parseInt(yStr, 10);
        monthIndex = parseInt(mStr, 10) - 1;
      }
      const data = await analyticsService.getFullAnalytics(year, monthIndex);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getTaskAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getTaskConsistency();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getFullAnalytics();
      res.json(data.monthlyConsistency || []);
    } catch (err) {
      next(err);
    }
  },

  async getStreaks(req, res, next) {
    try {
      const data = await analyticsService.getStreaks();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async resetData(req, res, next) {
    try {
      await db.clearAll();
      res.json({ success: true, message: 'All tracker data reset' });
    } catch (err) {
      next(err);
    }
  },
};

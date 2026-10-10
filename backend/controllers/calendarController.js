import { completionService } from '../services/completionService.js';
import { getTodayString } from '../utils/dateHelper.js';

export const calendarController = {
  async getCalendar(req, res, next) {
    try {
      const monthStr = req.query.month || getTodayString().substring(0, 7);
      const data = await completionService.getCalendarData(monthStr);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};

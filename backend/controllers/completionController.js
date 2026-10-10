import { completionService } from '../services/completionService.js';

export const completionController = {
  async getAllCompletions(req, res, next) {
    try {
      const { month, taskId } = req.query;
      const records = await completionService.getCompletions(month, taskId);
      res.json(records);
    } catch (err) {
      next(err);
    }
  },

  async putCompletion(req, res, next) {
    try {
      const taskId = req.body.taskId || req.body.task_id;
      const date = req.body.completionDate || req.body.completion_date || req.body.date;
      const completed = req.body.completed;
      if (!taskId || !date) {
        return res.status(400).json({ error: 'taskId and completionDate are required' });
      }
      const result = await completionService.setCompletion(taskId, date, completed);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getTaskCompletions(req, res, next) {
    try {
      const { id } = req.params;
      const completions = await completionService.getCompletionsForTask(id);
      res.json(completions);
    } catch (err) {
      next(err);
    }
  },

  async setTaskCompletion(req, res, next) {
    try {
      const { id, date } = req.params;
      const { completed } = req.body;
      const result = await completionService.setCompletion(id, date, completed);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

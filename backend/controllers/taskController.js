import { taskService } from '../services/taskService.js';

export const taskController = {
  async getAllTasks(req, res, next) {
    try {
      const tasks = await taskService.getAllTasks();
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.updateTask(id, req.body);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async deactivateTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.deactivateTask(id);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const result = await taskService.deleteTask(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

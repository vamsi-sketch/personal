import { db } from '../database/db.js';

export const taskService = {
  async getAllTasks() {
    return await db.getAllTasks();
  },

  async getTaskById(id) {
    return await db.getTaskById(id);
  },

  async createTask(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Task name is required');
    }
    if (!data.start_date) {
      throw new Error('Task start_date is required');
    }
    return await db.createTask({
      name: data.name.trim(),
      category: data.category?.trim() || 'General',
      description: data.description?.trim() || '',
      start_date: data.start_date,
      active: data.active !== undefined ? Boolean(data.active) : true,
    });
  },

  async updateTask(id, updates) {
    const existing = await db.getTaskById(id);
    if (!existing) {
      throw new Error('Task not found');
    }
    const cleanUpdates = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.category !== undefined) cleanUpdates.category = updates.category.trim();
    if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
    if (updates.start_date !== undefined) cleanUpdates.start_date = updates.start_date;
    if (updates.active !== undefined) cleanUpdates.active = Boolean(updates.active);

    return await db.updateTask(id, cleanUpdates);
  },

  async deactivateTask(id) {
    const existing = await db.getTaskById(id);
    if (!existing) {
      throw new Error('Task not found');
    }
    return await db.deactivateTask(id);
  },

  async deleteTask(id) {
    const success = await db.deleteTask(id);
    if (!success) {
      throw new Error('Task not found');
    }
    return { success: true };
  },
};

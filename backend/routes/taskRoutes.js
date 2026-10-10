import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';
import { completionController } from '../controllers/completionController.js';

const router = Router();

// /api/tasks
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id', taskController.updateTask);
router.patch('/:id/deactivate', taskController.deactivateTask);
router.delete('/:id', taskController.deleteTask);

// /api/tasks/:id/completions
router.get('/:id/completions', completionController.getTaskCompletions);
router.put('/:id/completions/:date', completionController.setTaskCompletion);

export default router;

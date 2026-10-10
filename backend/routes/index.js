import { Router } from 'express';
import taskRoutes from './taskRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import { analyticsController } from '../controllers/analyticsController.js';
import { completionController } from '../controllers/completionController.js';

const router = Router();

router.use('/tasks', taskRoutes);
router.use('/calendar', calendarRoutes);
router.use('/analytics', analyticsRoutes);

// /api/completions
router.get('/completions', completionController.getAllCompletions);
router.put('/completions', completionController.putCompletion);

router.get('/streaks', analyticsController.getStreaks);
router.post('/reset', analyticsController.resetData);

export default router;

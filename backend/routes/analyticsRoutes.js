import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';

const router = Router();

// /api/analytics
router.get('/', analyticsController.getAnalytics);
router.get('/tasks', analyticsController.getTaskAnalytics);
router.get('/monthly', analyticsController.getMonthlyAnalytics);

export default router;

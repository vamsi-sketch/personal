import { Router } from 'express';
import { calendarController } from '../controllers/calendarController.js';

const router = Router();

// /api/calendar?month=YYYY-MM
router.get('/', calendarController.getCalendar);

export default router;

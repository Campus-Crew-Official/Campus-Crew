import { Router } from 'express';
import {
  checkInWithQr,
  markManualAttendance,
  getEventAttendanceStats,
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { qrCheckInSchema, manualAttendanceSchema } from '../validators/schemas.js';

const router = Router();

router.post('/checkin-qr', authenticate, validate(qrCheckInSchema), checkInWithQr);
router.post('/events/:eventId/manual', authenticate, validate(manualAttendanceSchema), markManualAttendance);
router.get('/events/:eventId/stats', authenticate, getEventAttendanceStats);

export default router;

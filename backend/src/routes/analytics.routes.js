import { Router } from 'express';
import {
  getAdminStats,
  getCoordinatorStats,
  exportEventReportCsv,
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.get('/admin', authenticate, requireRole('ADMIN'), getAdminStats);
router.get('/coordinator/clubs/:clubId', authenticate, getCoordinatorStats);
router.get('/events/:eventId/export-csv', authenticate, exportEventReportCsv);

export default router;

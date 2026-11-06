import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updatePreferenceSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.patch('/read-all', authenticate, markAllAsRead);
router.patch('/:id/read', authenticate, markAsRead);

router.get('/preferences', authenticate, getPreferences);
router.patch('/preferences', authenticate, validate(updatePreferenceSchema), updatePreferences);

export default router;

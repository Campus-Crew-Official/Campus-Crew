import { Router } from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  togglePinAnnouncement,
} from '../controllers/announcement.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createAnnouncementSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', authenticate, validate(createAnnouncementSchema), createAnnouncement);
router.patch('/:id/pin', authenticate, togglePinAnnouncement);

export default router;

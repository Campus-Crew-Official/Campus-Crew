import { Router } from 'express';
import {
  listUsers,
  updateUserStatus,
  updateUserRole,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

// Admin-only user management
router.use(authenticate, requireRole('ADMIN'));

router.get('/', listUsers);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);

export default router;

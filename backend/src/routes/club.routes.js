import { Router } from 'express';
import {
  getClubs,
  getClubByIdOrSlug,
  createClub,
  updateClub,
  joinClub,
  updateMemberRole,
  removeMember,
  approveClub,
  rejectClub,
} from '../controllers/club.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { requireRole, requireClubCoordinator } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createClubSchema, updateClubSchema } from '../validators/schemas.js';

const router = Router();

// Public / Authenticated discovery
router.get('/', optionalAuthenticate, getClubs);
router.get('/:identifier', optionalAuthenticate, getClubByIdOrSlug);

// Authenticated Actions
router.post('/', authenticate, validate(createClubSchema), createClub);
router.put('/:id', authenticate, requireClubCoordinator('id'), validate(updateClubSchema), updateClub);
router.post('/:id/join', authenticate, joinClub);
router.patch('/:id/members/:memberId/role', authenticate, requireClubCoordinator('id'), updateMemberRole);
router.delete('/:id/members/:memberId', authenticate, requireClubCoordinator('id'), removeMember);

// Admin-Only Actions
router.patch('/:id/approve', authenticate, requireRole('ADMIN'), approveClub);
router.patch('/:id/reject', authenticate, requireRole('ADMIN'), rejectClub);

export default router;

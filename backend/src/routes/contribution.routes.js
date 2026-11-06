import { Router } from 'express';
import {
  getLeaderboard,
  getMyContributions,
  awardManualPoints,
} from '../controllers/contribution.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { manualContributionSchema } from '../validators/schemas.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/my-history', authenticate, getMyContributions);
router.post('/award', authenticate, requireRole('ADMIN', 'COORDINATOR'), validate(manualContributionSchema), awardManualPoints);

export default router;

import { Router } from 'express';
import {
  createDrive,
  getDrivesByClub,
  getDriveDetails,
  applyToDrive,
  getMyApplications,
  getDriveApplicants,
  updateApplicationStatus,
} from '../controllers/recruitment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireClubCoordinator } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  createDriveSchema,
  applyDriveSchema,
  updateAppStatusSchema,
} from '../validators/schemas.js';

const router = Router();

router.get('/my-applications', authenticate, getMyApplications);
router.get('/drives/:id', getDriveDetails);
router.post('/drives/:id/apply', authenticate, validate(applyDriveSchema), applyToDrive);

// Club Coordinator endpoints
router.get('/clubs/:clubId/drives', getDrivesByClub);
router.post('/clubs/:clubId/drives', authenticate, requireClubCoordinator('clubId'), validate(createDriveSchema), createDrive);
router.get('/drives/:id/applicants', authenticate, getDriveApplicants);
router.patch('/applications/:applicationId/status', authenticate, validate(updateAppStatusSchema), updateApplicationStatus);

export default router;

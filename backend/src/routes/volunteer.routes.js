import { Router } from 'express';
import {
  createOpportunity,
  getOpportunitiesByEvent,
  applyForOpportunity,
  assignVolunteer,
  requestReplacement,
  getMyVolunteerAssignments,
} from '../controllers/volunteer.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createVolunteerOppSchema,
  applyVolunteerSchema,
  assignVolunteerSchema,
} from '../validators/schemas.js';

const router = Router();

router.get('/my-volunteer', authenticate, getMyVolunteerAssignments);
router.get('/events/:eventId/opportunities', getOpportunitiesByEvent);
router.post('/events/:eventId/opportunities', authenticate, validate(createVolunteerOppSchema), createOpportunity);

router.post('/opportunities/:opportunityId/apply', authenticate, validate(applyVolunteerSchema), applyForOpportunity);
router.post('/opportunities/:opportunityId/assign', authenticate, validate(assignVolunteerSchema), assignVolunteer);

router.post('/assignments/:assignmentId/replace', authenticate, requestReplacement);

export default router;

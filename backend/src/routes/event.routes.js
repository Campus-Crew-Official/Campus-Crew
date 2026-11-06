import { Router } from 'express';
import {
  getEvents,
  getEventBySlugOrId,
  createEvent,
  updateEvent,
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getEventParticipants,
} from '../controllers/event.controller.js';
import { authenticate } from '../middleware/auth.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { requireClubCoordinator } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../validators/schemas.js';

const router = Router();

// Public / Discovery
router.get('/', optionalAuthenticate, getEvents);
router.get('/my-events', authenticate, getMyEvents);
router.get('/:identifier', optionalAuthenticate, getEventBySlugOrId);


// Coordinator Event Management
router.post('/', authenticate, validate(createEventSchema), createEvent);
router.put('/:id', authenticate, validate(updateEventSchema), updateEvent);
router.get('/:id/participants', authenticate, getEventParticipants);

// Concurrency-Safe Student Registration
router.post('/:id/register', authenticate, registerForEvent);
router.delete('/:id/register', authenticate, cancelRegistration);

export default router;

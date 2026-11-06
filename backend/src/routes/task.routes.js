import { Router } from 'express';
import {
  createTask,
  getTasksByEvent,
  getMyTasks,
  updateTaskStatus,
  verifyTask,
  reassignTask,
  addTaskComment,
  getTaskComments,
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskStatusSchema,
  taskCommentSchema,
} from '../validators/schemas.js';

const router = Router();

router.get('/my-tasks', authenticate, getMyTasks);
router.get('/events/:eventId', authenticate, getTasksByEvent);
router.post('/events/:eventId', authenticate, validate(createTaskSchema), createTask);

router.patch('/:id/status', authenticate, validate(updateTaskStatusSchema), updateTaskStatus);
router.patch('/:id/verify', authenticate, verifyTask);
router.patch('/:id/reassign', authenticate, reassignTask);

router.get('/:id/comments', authenticate, getTaskComments);
router.post('/:id/comments', authenticate, validate(taskCommentSchema), addTaskComment);

export default router;

import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../services/notification.service.js';

export const createTask = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { assignedToUserId, title, description, priority, deadline, pointsValue } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true },
    });

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    const task = await prisma.task.create({
      data: {
        eventId,
        assignedToUserId,
        title,
        description,
        priority: priority || 'MEDIUM',
        deadline: new Date(deadline),
        pointsValue: parseInt(pointsValue) || 5,
        status: 'PENDING',
      },
      include: {
        assignedToUser: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify assigned volunteer
    await createNotification({
      userId: assignedToUserId,
      title: `New Task Assigned: ${title} 📋`,
      message: `You have been assigned "${title}" for event "${event.title}". Deadline: ${new Date(deadline).toLocaleDateString()}.`,
      type: 'TASK_ASSIGNED',
      linkUrl: `/student/tasks`,
    });

    return sendSuccess(res, 'Task assigned successfully!', task, 201);
  } catch (error) {
    next(error);
  }
};

export const getTasksByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { eventId },
      include: {
        assignedToUser: {
          select: { id: true, name: true, rollNumber: true, department: true, avatarUrl: true },
        },
        verifiedByUser: {
          select: { id: true, name: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
    });

    return sendSuccess(res, 'Event tasks retrieved', tasks);
  } catch (error) {
    next(error);
  }
};

export const getMyTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const tasks = await prisma.task.findMany({
      where: { assignedToUserId: userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            club: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { deadline: 'asc' },
    });

    return sendSuccess(res, 'Your assigned tasks', tasks);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        event: { include: { createdBy: true } },
      },
    });

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    // Only assignee or coordinator can update
    const isAssignee = task.assignedToUserId === userId;
    const isCoordinator = req.user.role === 'ADMIN' || req.user.role === 'COORDINATOR';

    if (!isAssignee && !isCoordinator) {
      return sendError(res, 'Access denied. You can only update tasks assigned to you.', 403);
    }

    // Students cannot self-verify
    if (status === 'VERIFIED' && !isCoordinator) {
      return sendError(res, 'Only a club coordinator or administrator can verify tasks.', 403);
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status,
        ...(status === 'VERIFIED' && {
          verifiedById: userId,
          verifiedAt: new Date(),
        }),
      },
      include: {
        assignedToUser: { select: { id: true, name: true } },
      },
    });

    // Notify coordinator if volunteer marks task completed
    if (status === 'COMPLETED' && isAssignee) {
      await createNotification({
        userId: task.event.createdById,
        title: `Task Completed: ${task.title} ✅`,
        message: `${req.user.name} marked "${task.title}" as completed. Please review and verify.`,
        type: 'TASK_STATUS',
        linkUrl: `/coordinator/events/${task.eventId}/tasks`,
      });
    }

    return sendSuccess(res, `Task status updated to ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Coordinator Verification:
 * Verifies task completion and automatically awards contribution points
 * in an atomic transaction to prevent double-crediting!
 */
export const verifyTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const verifierId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        event: { include: { club: true } },
        assignedToUser: true,
      },
    });

    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    if (task.status === 'VERIFIED') {
      return sendError(res, 'Task has already been verified and points awarded.', 400);
    }

    const pointsToAward = task.pointsValue || 5;

    await prisma.$transaction(async (tx) => {
      // 1. Mark task verified
      await tx.task.update({
        where: { id },
        data: {
          status: 'VERIFIED',
          verifiedById: verifierId,
          verifiedAt: new Date(),
        },
      });

      // 2. Prevent duplicate points in Contribution ledger
      const existingContribution = await tx.contribution.findFirst({
        where: {
          userId: task.assignedToUserId,
          eventId: task.eventId,
          category: 'TASK_COMPLETION',
          reason: { contains: task.title },
        },
      });

      if (!existingContribution) {
        await tx.contribution.create({
          data: {
            userId: task.assignedToUserId,
            clubId: task.event.clubId,
            eventId: task.eventId,
            points: pointsToAward,
            category: 'TASK_COMPLETION',
            reason: `Successfully completed verified task: "${task.title}"`,
            verifiedById: verifierId,
          },
        });
      }
    });

    // Notify volunteer of verification and points!
    await createNotification({
      userId: task.assignedToUserId,
      title: `Task Verified: +${pointsToAward} Points! 🌟`,
      message: `Your task "${task.title}" has been verified! You earned ${pointsToAward} contribution points.`,
      type: 'TASK_STATUS',
      linkUrl: `/student/tasks`,
    });

    return sendSuccess(res, `Task verified and ${pointsToAward} points awarded!`);
  } catch (error) {
    next(error);
  }
};

export const reassignTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedToUserId } = req.body;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        assignedToUserId,
        status: 'PENDING',
      },
      include: {
        assignedToUser: true,
        event: true,
      },
    });

    await createNotification({
      userId: assignedToUserId,
      title: `Task Reassigned to You: ${updated.title} 📋`,
      message: `You have been reassigned the task "${updated.title}" for event "${updated.event.title}".`,
      type: 'TASK_ASSIGNED',
      linkUrl: `/student/tasks`,
    });

    return sendSuccess(res, 'Task reassigned successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const newComment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });

    return sendSuccess(res, 'Comment posted successfully', newComment, 201);
  } catch (error) {
    next(error);
  }
};

export const getTaskComments = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return sendSuccess(res, 'Task comments retrieved', comments);
  } catch (error) {
    next(error);
  }
};

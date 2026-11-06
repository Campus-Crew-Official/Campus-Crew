import cron from 'node-cron';
import prisma from '../config/db.js';
import { createNotification } from '../services/notification.service.js';

export const initScheduledJobs = () => {
  console.log('⏰ Initializing automated cron reminders (node-cron)...');

  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();

      // 1. 24-Hour Event Reminders (23h - 25h window)
      const window24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const window24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const events24h = await prisma.event.findMany({
        where: {
          startDateTime: { gte: window24hStart, lte: window24hEnd },
          status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED'] },
        },
        include: {
          registrations: {
            where: { status: 'REGISTERED' },
          },
        },
      });

      for (const event of events24h) {
        for (const reg of event.registrations) {
          // Check if reminder was already generated in the last 20 hours
          const existing = await prisma.notification.findFirst({
            where: {
              userId: reg.userId,
              type: 'EVENT_REMINDER',
              message: { contains: event.title },
              createdAt: { gte: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
            },
          });

          if (!existing) {
            await createNotification({
              userId: reg.userId,
              title: `Upcoming Event Tomorrow: ${event.title}`,
              message: `Reminder: "${event.title}" begins tomorrow at ${event.venue}. Please bring your QR check-in ticket.`,
              type: 'EVENT_REMINDER',
              linkUrl: `/student/events`,
            });
          }
        }
      }

      // 2. 1-Hour Event Reminders (45m - 75m window)
      const window1hStart = new Date(now.getTime() + 45 * 60 * 1000);
      const window1hEnd = new Date(now.getTime() + 75 * 60 * 1000);

      const events1h = await prisma.event.findMany({
        where: {
          startDateTime: { gte: window1hStart, lte: window1hEnd },
          status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING'] },
        },
        include: {
          registrations: {
            where: { status: 'REGISTERED' },
          },
        },
      });

      for (const event of events1h) {
        for (const reg of event.registrations) {
          const existing = await prisma.notification.findFirst({
            where: {
              userId: reg.userId,
              type: 'EVENT_REMINDER',
              message: { contains: `starts in 1 hour: ${event.title}` },
              createdAt: { gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
            },
          });

          if (!existing) {
            await createNotification({
              userId: reg.userId,
              title: `Event Starts in 1 Hour! ⏳`,
              message: `starts in 1 hour: ${event.title} at ${event.venue}. Head to the venue for QR check-in.`,
              type: 'EVENT_REMINDER',
              linkUrl: `/student/events`,
            });
          }
        }
      }

      // 3. Task Deadline Reminders (tasks due within next 6 hours)
      const window6hEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const urgentTasks = await prisma.task.findMany({
        where: {
          deadline: { gte: now, lte: window6hEnd },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        include: {
          event: true,
        },
      });

      for (const task of urgentTasks) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId: task.assignedToUserId,
            type: 'TASK_REMINDER',
            message: { contains: task.title },
            createdAt: { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
          },
        });

        if (!existing) {
          await createNotification({
            userId: task.assignedToUserId,
            title: `Task Deadline Approaching! ⚠️`,
            message: `Task "${task.title}" for event "${task.event.title}" is due in less than 6 hours.`,
            type: 'TASK_REMINDER',
            linkUrl: `/student/tasks`,
          });
        }
      }
    } catch (err) {
      console.error('Error during scheduled reminder execution:', err);
    }
  });
};

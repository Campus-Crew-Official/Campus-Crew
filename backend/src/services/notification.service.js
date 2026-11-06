import prisma from '../config/db.js';
import { broadcastNotification } from '../sockets/socketManager.js';

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  linkUrl = null,
}) => {
  try {
    // Check user preference
    const pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (pref) {
      if (type.startsWith('EVENT') && !pref.inAppEvents) return null;
      if (type.startsWith('TASK') && !pref.inAppTasks) return null;
      if (type === 'ANNOUNCEMENT' && !pref.inAppAnnouncements) return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        linkUrl,
      },
    });

    // Real-time delivery via Socket.IO
    broadcastNotification(notification);

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

export const createBulkNotifications = async (notificationsList) => {
  try {
    const results = [];
    for (const item of notificationsList) {
      const created = await createNotification(item);
      if (created) results.push(created);
    }
    return results;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    return [];
  }
};

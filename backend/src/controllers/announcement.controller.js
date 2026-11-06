import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createBulkNotifications } from '../services/notification.service.js';
import { emitToClub, emitToEvent } from '../sockets/socketManager.js';

export const createAnnouncement = async (req, res, next) => {
  try {
    const { clubId, eventId, title, content, targetRole, isPinned } = req.body;
    const authorId = req.user.id;

    if (!clubId && !eventId) {
      return sendError(res, 'Either a clubId or eventId must be associated with the announcement.', 400);
    }

    const announcement = await prisma.announcement.create({
      data: {
        clubId: clubId || null,
        eventId: eventId || null,
        authorId,
        title,
        content,
        targetRole: targetRole || 'ALL',
        isPinned: !!isPinned,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        club: { select: { id: true, name: true, slug: true } },
        event: { select: { id: true, title: true, slug: true } },
      },
    });

    // Real-time broadcast
    if (clubId) {
      emitToClub(clubId, 'announcement:new', announcement);
    }
    if (eventId) {
      emitToEvent(eventId, 'announcement:new', announcement);
    }

    // Determine target recipient users for persistent in-app notifications
    let targetUserIds = [];

    if (eventId) {
      if (targetRole === 'VOLUNTEERS') {
        const volunteers = await prisma.volunteerAssignment.findMany({
          where: { eventId, status: { in: ['ASSIGNED', 'COMPLETED'] } },
          select: { userId: true },
        });
        targetUserIds = volunteers.map((v) => v.userId);
      } else {
        const registrations = await prisma.eventRegistration.findMany({
          where: { eventId, status: 'REGISTERED' },
          select: { userId: true },
        });
        targetUserIds = registrations.map((r) => r.userId);
      }
    } else if (clubId) {
      const members = await prisma.clubMembership.findMany({
        where: { clubId, status: 'ACTIVE' },
        select: { userId: true },
      });
      targetUserIds = members.map((m) => m.userId);
    }

    // Filter out author
    targetUserIds = targetUserIds.filter((uid) => uid !== authorId);

    const notifications = targetUserIds.map((userId) => ({
      userId,
      title: `Announcement: ${title} 📢`,
      message: content.length > 100 ? `${content.substring(0, 97)}...` : content,
      type: 'ANNOUNCEMENT',
      linkUrl: eventId ? `/events/${announcement.event?.slug}` : `/clubs/${announcement.club?.slug}`,
    }));

    await createBulkNotifications(notifications);

    return sendSuccess(res, 'Announcement published successfully!', announcement, 201);
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const { clubId, eventId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (clubId) where.clubId = clubId;
    if (eventId) where.eventId = eventId;

    const [total, announcements] = await Promise.all([
      prisma.announcement.count({ where }),
      prisma.announcement.findMany({
        where,
        skip,
        take,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, role: true } },
          club: { select: { id: true, name: true, slug: true } },
          event: { select: { id: true, title: true, slug: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    return sendSuccess(res, 'Announcements retrieved', announcements, 200, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

export const togglePinAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return sendError(res, 'Announcement not found', 404);
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: { isPinned: !announcement.isPinned },
    });

    return sendSuccess(res, `Announcement ${updated.isPinned ? 'pinned' : 'unpinned'}`, updated);
  } catch (error) {
    next(error);
  }
};

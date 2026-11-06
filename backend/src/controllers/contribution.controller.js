import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../services/notification.service.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { clubId, category, limit = 25 } = req.query;

    const where = {};
    if (clubId) where.clubId = clubId;
    if (category) where.category = category;

    // Aggregate points per user
    const userPoints = await prisma.contribution.groupBy({
      by: ['userId'],
      where,
      _sum: { points: true },
      _count: { id: true },
      orderBy: {
        _sum: { points: 'desc' },
      },
      take: parseInt(limit),
    });

    const userIds = userPoints.map((up) => up.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        rollNumber: true,
        department: true,
        year: true,
        avatarUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = userPoints.map((up, index) => {
      const u = userMap.get(up.userId);
      return {
        rank: index + 1,
        user: u,
        totalPoints: up._sum.points || 0,
        contributionsCount: up._count.id,
      };
    });

    return sendSuccess(res, 'Leaderboard retrieved', leaderboard);
  } catch (error) {
    next(error);
  }
};

export const getMyContributions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [contributions, aggregate] = await Promise.all([
      prisma.contribution.findMany({
        where: { userId },
        include: {
          club: { select: { id: true, name: true, slug: true } },
          event: { select: { id: true, title: true, slug: true } },
          verifier: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contribution.aggregate({
        where: { userId },
        _sum: { points: true },
        _count: { id: true },
      }),
    ]);

    return sendSuccess(res, 'Your contributions history', {
      totalPoints: aggregate._sum.points || 0,
      totalContributions: aggregate._count.id,
      history: contributions,
    });
  } catch (error) {
    next(error);
  }
};

export const awardManualPoints = async (req, res, next) => {
  try {
    const { userId, clubId, eventId, points, reason, category } = req.body;
    const verifiedById = req.user.id;

    const contribution = await prisma.contribution.create({
      data: {
        userId,
        clubId: clubId || null,
        eventId: eventId || null,
        points: parseInt(points),
        reason,
        category: category || 'COORDINATION',
        verifiedById,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    await createNotification({
      userId,
      title: `+${points} Contribution Points Awarded! 🏆`,
      message: `You were awarded ${points} points by ${req.user.name}: "${reason}".`,
      type: 'TASK_STATUS',
      linkUrl: `/student/contributions`,
    });

    return sendSuccess(res, `Awarded ${points} points to ${contribution.user.name}`, contribution, 201);
  } catch (error) {
    next(error);
  }
};

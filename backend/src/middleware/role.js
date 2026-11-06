import prisma from '../config/db.js';
import { sendError } from '../utils/response.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

export const requireClubCoordinator = (clubIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      // Admins bypass club-specific checks
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const clubId = req.params[clubIdParam] || req.body[clubIdParam] || req.query[clubIdParam];
      if (!clubId) {
        return sendError(res, 'Club identifier is required for authorization check.', 400);
      }

      // Check if user is the direct student coordinator or has club membership with COORDINATOR/SECRETARY role
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: {
          id: true,
          studentCoordinatorId: true,
          members: {
            where: {
              userId: req.user.id,
              status: 'ACTIVE',
              role: { in: ['COORDINATOR', 'SECRETARY'] },
            },
          },
        },
      });

      if (!club) {
        return sendError(res, 'Club not found.', 404);
      }

      const isCoordinator =
        club.studentCoordinatorId === req.user.id ||
        (club.members && club.members.length > 0) ||
        req.user.role === 'COORDINATOR';

      if (!isCoordinator) {
        return sendError(res, 'Access denied. You are not authorized to manage this club.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

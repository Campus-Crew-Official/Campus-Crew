import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          rollNumber: true,
          department: true,
          year: true,
          phone: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              clubMemberships: { where: { status: 'ACTIVE' } },
              eventRegistrations: { where: { status: 'REGISTERED' } },
              contributions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return sendSuccess(res, 'Users list retrieved', users, 200, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return sendError(res, 'Invalid status. Must be ACTIVE or SUSPENDED.', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true },
    });

    return sendSuccess(res, `User ${user.name} is now ${status}`, user);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'COORDINATOR', 'STUDENT'].includes(role)) {
      return sendError(res, 'Invalid role.', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return sendSuccess(res, `User ${user.name} role changed to ${role}`, user);
  } catch (error) {
    next(error);
  }
};

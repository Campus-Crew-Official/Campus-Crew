import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name, rollNumber, department, year, phone, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { rollNumber }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return sendError(res, 'An account with this institutional email already exists.', 409);
      }
      return sendError(res, 'An account with this roll number already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        rollNumber,
        department,
        year,
        phone,
        role: role === 'COORDINATOR' ? 'COORDINATOR' : 'STUDENT',
        status: 'ACTIVE',
        notificationPreference: {
          create: {
            emailEventReminders: true,
            emailTaskUpdates: true,
            emailRecruitment: true,
            inAppAnnouncements: true,
            inAppTasks: true,
            inAppEvents: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        department: true,
        year: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    setAuthCookie(res, token);

    return sendSuccess(res, 'Account created successfully!', { user, token }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, 'Invalid institutional email or password.', 401);
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 'Your account has been suspended by the platform administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid institutional email or password.', 401);
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    setAuthCookie(res, token);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      rollNumber: user.rollNumber,
      department: user.department,
      year: user.year,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
    };

    return sendSuccess(res, 'Logged in successfully!', { user: safeUser, token });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, 'Logged out successfully.');
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        department: true,
        year: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        notificationPreference: true,
        clubMemberships: {
          where: { status: 'ACTIVE' },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, 'Current user profile loaded.', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, department, year, phone, avatarUrl } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(department && { department }),
        ...(year && { year }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        department: true,
        year: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
    });

    return sendSuccess(res, 'Profile updated successfully!', updated);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash },
    });

    return sendSuccess(res, 'Password changed successfully!');
  } catch (error) {
    next(error);
  }
};

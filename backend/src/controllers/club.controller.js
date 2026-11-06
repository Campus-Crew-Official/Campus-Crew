import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../services/notification.service.js';

export const getClubs = async (req, res, next) => {
  try {
    const { category, search, status, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // Filter by approval status
    if (status) {
      if (req.user?.role === 'ADMIN') {
        where.status = status;
      } else {
        where.status = 'APPROVED';
      }
    } else if (req.user?.role !== 'ADMIN') {
      where.status = 'APPROVED';
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, clubs] = await Promise.all([
      prisma.club.count({ where }),
      prisma.club.findMany({
        where,
        skip,
        take,
        include: {
          studentCoordinator: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          _count: {
            select: {
              members: { where: { status: 'ACTIVE' } },
              events: true,
              recruitmentDrives: { where: { status: 'OPEN' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return sendSuccess(res, 'Clubs retrieved successfully', clubs, 200, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

export const getClubByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const club = await prisma.club.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        studentCoordinator: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { id: true, name: true, rollNumber: true, department: true, avatarUrl: true },
            },
          },
          orderBy: { role: 'asc' },
        },
        events: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { startDateTime: 'asc' },
          take: 5,
        },
        recruitmentDrives: {
          where: { status: 'OPEN' },
        },
        announcements: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 5,
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } },
            events: true,
          },
        },
      },
    });

    if (!club) {
      return sendError(res, 'Club not found', 404);
    }

    return sendSuccess(res, 'Club details loaded', club);
  } catch (error) {
    next(error);
  }
};

export const createClub = async (req, res, next) => {
  try {
    const { name, slug, description, category, facultyCoordinator, contactEmail, contactPhone, logoUrl, bannerUrl } = req.body;

    const existing = await prisma.club.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      return sendError(res, 'A club with this name or slug already exists', 409);
    }

    const isAdmin = req.user.role === 'ADMIN';

    const club = await prisma.club.create({
      data: {
        name,
        slug,
        description,
        category,
        facultyCoordinator,
        contactEmail,
        contactPhone,
        logoUrl,
        bannerUrl,
        studentCoordinatorId: req.user.id,
        status: isAdmin ? 'APPROVED' : 'PENDING_APPROVAL',
        members: {
          create: {
            userId: req.user.id,
            role: 'COORDINATOR',
            status: 'ACTIVE',
          },
        },
      },
    });

    // Notify user
    await createNotification({
      userId: req.user.id,
      title: isAdmin ? 'Club Created & Approved! 🚀' : 'Club Registration Submitted! 📋',
      message: isAdmin
        ? `Club "${club.name}" is now active and public.`
        : `Club "${club.name}" has been submitted for platform administrator review.`,
      type: 'ANNOUNCEMENT',
      linkUrl: `/clubs/${club.slug}`,
    });

    return sendSuccess(
      res,
      isAdmin ? 'Club created and approved successfully!' : 'Club submitted for administrative approval!',
      club,
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await prisma.club.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 'Club updated successfully!', updated);
  } catch (error) {
    next(error);
  }
};

export const joinClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const club = await prisma.club.findUnique({
      where: { id },
    });

    // Ensure there is an open recruitment drive for the club
    const openRecruitment = await prisma.recruitmentDrive.findFirst({
      where: { clubId: id, status: 'OPEN' },
    });
    if (!openRecruitment) {
      return sendError(res, 'Club recruitment is not open currently', 403);
    }

    if (!club || club.status !== 'APPROVED') {
      return sendError(res, 'Active club not found', 404);
    }

    const existingMembership = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId: id, userId } },
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        return sendError(res, 'You are already an active member of this club.', 400);
      }
      // Reactivate
      const reactivated = await prisma.clubMembership.update({
        where: { id: existingMembership.id },
        data: { status: 'ACTIVE' },
      });
      return sendSuccess(res, 'Rejoined club successfully!', reactivated);
    }

    const membership = await prisma.clubMembership.create({
      data: {
        clubId: id,
        userId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    await createNotification({
      userId,
      title: `Welcome to ${club.name}! 🎉`,
      message: `You are now a registered member of ${club.name}. Check out upcoming events and announcements.`,
      type: 'ANNOUNCEMENT',
      linkUrl: `/clubs/${club.slug}`,
    });

    return sendSuccess(res, `Joined ${club.name} successfully!`, membership, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;

    const membership = await prisma.clubMembership.update({
      where: { id: memberId },
      data: { role },
      include: { user: true, club: true },
    });

    await createNotification({
      userId: membership.userId,
      title: `Role Updated in ${membership.club.name}`,
      message: `Your membership role has been updated to ${role}.`,
      type: 'ANNOUNCEMENT',
      linkUrl: `/clubs/${membership.club.slug}`,
    });

    return sendSuccess(res, 'Member role updated successfully', membership);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;

    await prisma.clubMembership.delete({
      where: { id: memberId },
    });

    return sendSuccess(res, 'Member removed from club successfully');
  } catch (error) {
    next(error);
  }
};

export const approveClub = async (req, res, next) => {
  try {
    const { id } = req.params;

    const club = await prisma.club.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    if (club.studentCoordinatorId) {
      await createNotification({
        userId: club.studentCoordinatorId,
        title: `Club Approved! 🎉 ${club.name}`,
        message: `Your club "${club.name}" has been approved by the platform administrator and is now live.`,
        type: 'ANNOUNCEMENT',
        linkUrl: `/clubs/${club.slug}`,
      });
    }

    return sendSuccess(res, 'Club approved successfully!', club);
  } catch (error) {
    next(error);
  }
};

export const rejectClub = async (req, res, next) => {
  try {
    const { id } = req.params;

    const club = await prisma.club.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    if (club.studentCoordinatorId) {
      await createNotification({
        userId: club.studentCoordinatorId,
        title: `Club Registration Update`,
        message: `Your club proposal "${club.name}" was not approved at this time.`,
        type: 'ANNOUNCEMENT',
        linkUrl: `/clubs`,
      });
    }

    return sendSuccess(res, 'Club proposal rejected', club);
  } catch (error) {
    next(error);
  }
};

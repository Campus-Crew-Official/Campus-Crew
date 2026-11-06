import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../services/notification.service.js';

export const createDrive = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { title, description, requirements, deadline } = req.body;

    const drive = await prisma.recruitmentDrive.create({
      data: {
        clubId,
        title,
        description,
        requirements,
        deadline: new Date(deadline),
        status: 'OPEN',
      },
    });

    return sendSuccess(res, 'Recruitment drive opened successfully!', drive, 201);
  } catch (error) {
    next(error);
  }
};

export const getDrivesByClub = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    const drives = await prisma.recruitmentDrive.findMany({
      where: { clubId },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Recruitment drives retrieved', drives);
  } catch (error) {
    next(error);
  }
};

export const getDriveDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id },
      include: {
        club: true,
        _count: { select: { applications: true } },
      },
    });

    if (!drive) {
      return sendError(res, 'Recruitment drive not found', 404);
    }

    return sendSuccess(res, 'Drive details loaded', drive);
  } catch (error) {
    next(error);
  }
};

export const applyToDrive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { statementOfPurpose, experience, portfolioUrl } = req.body;

    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id },
      include: { club: true },
    });

    if (!drive || drive.status !== 'OPEN') {
      return sendError(res, 'This recruitment drive is not currently open for applications.', 400);
    }

    if (new Date() > new Date(drive.deadline)) {
      return sendError(res, 'The deadline for this recruitment drive has passed.', 400);
    }

    const existing = await prisma.recruitmentApplication.findUnique({
      where: { driveId_userId: { driveId: id, userId } },
    });

    if (existing) {
      return sendError(res, 'You have already submitted an application for this drive.', 409);
    }

    const application = await prisma.recruitmentApplication.create({
      data: {
        driveId: id,
        userId,
        statementOfPurpose,
        experience,
        portfolioUrl: portfolioUrl || null,
        status: 'PENDING',
      },
    });

    await createNotification({
      userId,
      title: 'Application Submitted Successfully! 📝',
      message: `Your application for "${drive.title}" has been received by ${drive.club.name}.`,
      type: 'RECRUITMENT_STATUS',
      linkUrl: `/student/applications`,
    });

    return sendSuccess(res, 'Application submitted successfully!', application, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const applications = await prisma.recruitmentApplication.findMany({
      where: { userId },
      include: {
        drive: {
          include: {
            club: {
              select: { id: true, name: true, slug: true, logoUrl: true, category: true },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return sendSuccess(res, 'Your applications retrieved', applications);
  } catch (error) {
    next(error);
  }
};

export const getDriveApplicants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where = { driveId: id };
    if (status) {
      where.status = status;
    }

    const applicants = await prisma.recruitmentApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            department: true,
            year: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return sendSuccess(res, 'Applicants list retrieved', applicants);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes } = req.body;

    const application = await prisma.recruitmentApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
      },
      include: {
        drive: {
          include: { club: true },
        },
        user: true,
      },
    });

    // If SELECTED, automatically add student to club as CORE_MEMBER if not already
    if (status === 'SELECTED') {
      await prisma.clubMembership.upsert({
        where: {
          clubId_userId: {
            clubId: application.drive.clubId,
            userId: application.userId,
          },
        },
        update: {
          role: 'CORE_MEMBER',
          status: 'ACTIVE',
        },
        create: {
          clubId: application.drive.clubId,
          userId: application.userId,
          role: 'CORE_MEMBER',
          status: 'ACTIVE',
        },
      });
    }

    // Notify student
    await createNotification({
      userId: application.userId,
      title: `Recruitment Status: ${status} 🎉`,
      message: `Your application for "${application.drive.title}" is now marked as "${status}". ${reviewNotes ? `Notes: ${reviewNotes}` : ''}`,
      type: 'RECRUITMENT_STATUS',
      linkUrl: `/student/applications`,
    });

    return sendSuccess(res, `Application status updated to ${status}`, application);
  } catch (error) {
    next(error);
  }
};

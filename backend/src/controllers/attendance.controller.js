import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../services/notification.service.js';

/**
 * QR Check-In Verification:
 * Validates the event checkInSecret AND the participant ticketCode.
 * Guarantees duplicate attendance cannot be recorded.
 */
export const checkInWithQr = async (req, res, next) => {
  try {
    const { ticketCode, checkInSecret } = req.body;
    const markerId = req.user.id;

    // 1. Verify event secret
    const event = await prisma.event.findUnique({
      where: { checkInSecret },
      include: { club: true },
    });

    if (!event) {
      return sendError(res, 'Invalid QR check-in code or event not recognized.', 400);
    }

    // 2. Verify registration and ticket code
    const registration = await prisma.eventRegistration.findUnique({
      where: { ticketCode },
      include: { user: true },
    });

    if (!registration) {
      return sendError(res, 'Invalid ticket code. Registration not found.', 404);
    }

    if (registration.eventId !== event.id) {
      return sendError(res, 'This ticket belongs to a different event!', 400);
    }

    if (registration.status !== 'REGISTERED') {
      return sendError(res, `Cannot check-in. Ticket status is ${registration.status}.`, 400);
    }

    // 3. Check for duplicate attendance
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: registration.userId,
        },
      },
    });

    if (existingAttendance) {
      return sendError(
        res,
        `Participant ${registration.user.name} was already checked in at ${new Date(existingAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        409
      );
    }

    // 4. Record attendance
    const attendance = await prisma.attendance.create({
      data: {
        eventId: event.id,
        userId: registration.userId,
        markedById: markerId,
        method: 'QR_SCAN',
        checkInTime: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, rollNumber: true, department: true } },
      },
    });

    // Notify student
    await createNotification({
      userId: registration.userId,
      title: `Checked In! 🎟️ ${event.title}`,
      message: `Your attendance for "${event.title}" has been verified at the entry gate. Enjoy the event!`,
      type: 'EVENT_REMINDER',
      linkUrl: `/student/events`,
    });

    return sendSuccess(res, `Verified check-in for ${registration.user.name}`, attendance, 201);
  } catch (error) {
    next(error);
  }
};

export const markManualAttendance = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    const markerId = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    // Check registration
    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
      include: { user: true },
    });

    if (!registration || registration.status !== 'REGISTERED') {
      return sendError(res, 'User is not an active registered participant for this event.', 400);
    }

    // Check duplicate
    const existing = await prisma.attendance.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existing) {
      return sendError(res, 'Attendance is already recorded for this student.', 409);
    }

    const attendance = await prisma.attendance.create({
      data: {
        eventId,
        userId,
        markedById: markerId,
        method: 'MANUAL',
        checkInTime: new Date(),
      },
      include: { user: true },
    });

    return sendSuccess(res, `Attendance marked manually for ${registration.user.name}`, attendance, 201);
  } catch (error) {
    next(error);
  }
};

export const getEventAttendanceStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const [event, registeredCount, attendances] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId } }),
      prisma.eventRegistration.count({ where: { eventId, status: 'REGISTERED' } }),
      prisma.attendance.findMany({
        where: { eventId },
        include: {
          user: {
            select: { id: true, name: true, rollNumber: true, department: true, email: true },
          },
          markedByUser: { select: { id: true, name: true } },
        },
        orderBy: { checkInTime: 'desc' },
      }),
    ]);

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    const checkedInCount = attendances.length;
    const percentage = registeredCount > 0 ? Math.round((checkedInCount / registeredCount) * 100) : 0;

    return sendSuccess(res, 'Attendance stats retrieved', {
      eventTitle: event.title,
      maxCapacity: event.maxCapacity,
      registeredCount,
      checkedInCount,
      percentage,
      attendances,
    });
  } catch (error) {
    next(error);
  }
};

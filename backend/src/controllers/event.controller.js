import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification, createBulkNotifications } from '../services/notification.service.js';
import { emitToEvent } from '../sockets/socketManager.js';

export const getEvents = async (req, res, next) => {
  try {
    const { category, status, search, clubId, upcoming, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (category) {
      where.category = category;
    }

    if (clubId) {
      where.clubId = clubId;
    }

    if (status) {
      where.status = status;
    } else if (req.user?.role !== 'ADMIN' && req.user?.role !== 'COORDINATOR') {
      where.status = { not: 'DRAFT' };
    }

    if (upcoming === 'true') {
      where.startDateTime = { gte: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take,
        include: {
          club: {
            select: { id: true, name: true, slug: true, logoUrl: true, category: true },
          },
          _count: {
            select: {
              registrations: { where: { status: 'REGISTERED' } },
              volunteerOpportunities: true,
            },
          },
        },
        orderBy: { startDateTime: 'asc' },
      }),
    ]);

    return sendSuccess(res, 'Events list retrieved', events, 200, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
};

export const getEventBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const userId = req.user?.id;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            category: true,
            contactEmail: true,
            studentCoordinator: { select: { id: true, name: true, email: true } },
          },
        },
        volunteerOpportunities: {
          include: {
            _count: { select: { assignments: true, applications: true } },
          },
        },
        announcements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            registrations: { where: { status: 'REGISTERED' } },
            tasks: true,
          },
        },
      },
    });

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    // Check user's registration status and volunteer status if logged in
    let userRegistration = null;
    let userVolunteerAssignment = null;

    if (userId) {
      userRegistration = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId } },
      });

      userVolunteerAssignment = await prisma.volunteerAssignment.findUnique({
        where: { eventId_userId: { eventId: event.id, userId } },
      });
    }

    return sendSuccess(res, 'Event details loaded', {
      ...event,
      userRegistration,
      userVolunteerAssignment,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const {
      clubId,
      title,
      slug,
      description,
      category,
      venue,
      startDateTime,
      endDateTime,
      registrationStartDate,
      registrationEndDate,
      maxCapacity,
      bannerUrl,
      status,
    } = req.body;

    const existing = await prisma.event.findFirst({
      where: { OR: [{ slug }, { title, clubId }] },
    });

    if (existing) {
      return sendError(res, 'An event with this title or slug already exists in this club.', 409);
    }

    const event = await prisma.event.create({
      data: {
        clubId,
        createdById: req.user.id,
        title,
        slug,
        description,
        category,
        venue,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        registrationStartDate: new Date(registrationStartDate),
        registrationEndDate: new Date(registrationEndDate),
        maxCapacity: parseInt(maxCapacity),
        registeredCount: 0,
        bannerUrl: bannerUrl || null,
        status: status || 'PUBLISHED',
      },
      include: { club: true },
    });

    // Notify club members about new event
    const clubMembers = await prisma.clubMembership.findMany({
      where: { clubId, status: 'ACTIVE' },
      select: { userId: true },
    });

    const notifications = clubMembers.map((m) => ({
      userId: m.userId,
      title: `New Event Announced: ${event.title} 📢`,
      message: `${event.club.name} has scheduled "${event.title}" on ${new Date(event.startDateTime).toLocaleDateString()}. Registration is opening soon!`,
      type: 'EVENT_NEW',
      linkUrl: `/events/${event.slug}`,
    }));

    await createBulkNotifications(notifications);

    return sendSuccess(res, 'Event created successfully!', event, 201);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      venue,
      startDateTime,
      endDateTime,
      registrationStartDate,
      registrationEndDate,
      maxCapacity,
      bannerUrl,
      status,
    } = req.body;

    const existing = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: { where: { status: 'REGISTERED' }, select: { userId: true } },
      },
    });

    if (!existing) {
      return sendError(res, 'Event not found', 404);
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (venue) updateData.venue = venue;
    if (startDateTime) updateData.startDateTime = new Date(startDateTime);
    if (endDateTime) updateData.endDateTime = new Date(endDateTime);
    if (registrationStartDate) updateData.registrationStartDate = new Date(registrationStartDate);
    if (registrationEndDate) updateData.registrationEndDate = new Date(registrationEndDate);
    if (maxCapacity) updateData.maxCapacity = parseInt(maxCapacity);
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (status) updateData.status = status;

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { club: true },
    });

    // Notify all registered attendees of changes
    const notifications = existing.registrations.map((r) => ({
      userId: r.userId,
      title: `Event Update: ${updated.title} ℹ️`,
      message: `Important updates have been made to "${updated.title}" (Venue: ${updated.venue}, Date: ${new Date(updated.startDateTime).toLocaleDateString()}).`,
      type: 'EVENT_UPDATE',
      linkUrl: `/events/${updated.slug}`,
    }));

    await createBulkNotifications(notifications);
    emitToEvent(id, 'event:updated', updated);

    return sendSuccess(res, 'Event updated successfully!', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * CONCURRENCY-SAFE REGISTRATION:
 * Enforces capacity with conditional atomic update and serializable transactions.
 * Guarantees that registeredCount will NEVER exceed maxCapacity even under simultaneous high-frequency requests.
 */
export const registerForEvent = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    // Check event basic eligibility
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return sendError(res, 'Event not found.', 404);
    }

    if (event.status !== 'REGISTRATION_OPEN' && event.status !== 'PUBLISHED') {
      return sendError(res, `Registration is closed for this event (Status: ${event.status}).`, 400);
    }

    const now = new Date();
    if (now < new Date(event.registrationStartDate)) {
      return sendError(res, 'Registration for this event has not opened yet.', 400);
    }
    if (now > new Date(event.registrationEndDate)) {
      return sendError(res, 'Registration deadline for this event has passed.', 400);
    }

    // Execute atomic registration in transaction with row-level lock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Acquire exclusive lock on the event row
      const lockedEvents = await tx.$queryRaw`
        SELECT id, "registeredCount", "maxCapacity", "status"
        FROM "Event"
        WHERE id = ${eventId}
        FOR UPDATE
      `;

      const lockedEvent = lockedEvents[0];
      if (!lockedEvent) {
        const err = new Error('Event not found.');
        err.statusCode = 404;
        throw err;
      }

      // 2. Strict capacity check on locked row
      if (lockedEvent.registeredCount >= lockedEvent.maxCapacity) {
        const err = new Error('Registration failed: Event is at maximum capacity.');
        err.statusCode = 409;
        throw err;
      }

      // 3. Check for existing registration
      const existing = await tx.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });

      if (existing && existing.status === 'REGISTERED') {
        const err = new Error('You are already registered for this event.');
        err.statusCode = 409;
        throw err;
      }

      // 4. Safely increment registered count
      await tx.$executeRaw`
        UPDATE "Event"
        SET "registeredCount" = "registeredCount" + 1
        WHERE id = ${eventId}
      `;

      // 5. Generate unique ticket code
      const ticketCode = `TKT-${event.slug.substring(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // 6. Save registration record
      let registration;
      if (existing) {
        registration = await tx.eventRegistration.update({
          where: { id: existing.id },
          data: {
            status: 'REGISTERED',
            ticketCode,
            registeredAt: new Date(),
            cancelledAt: null,
          },
        });
      } else {
        registration = await tx.eventRegistration.create({
          data: {
            eventId,
            userId,
            ticketCode,
            status: 'REGISTERED',
          },
        });
      }

      return { registration, ticketCode };
    });

    // Notify student
    await createNotification({
      userId,
      title: `Registration Confirmed! 🎟️ ${event.title}`,
      message: `You are confirmed for "${event.title}". Ticket code: ${result.ticketCode}. Access your QR pass from your dashboard.`,
      type: 'REGISTRATION_CONFIRMED',
      linkUrl: `/student/events`,
    });

    return sendSuccess(res, 'Registered successfully for the event!', result.registration, 201);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
      include: { event: true },
    });

    if (!registration || registration.status !== 'REGISTERED') {
      return sendError(res, 'Active registration not found for this event.', 404);
    }

    // Atomic transaction to cancel and decrement seat count safely
    await prisma.$transaction(async (tx) => {
      await tx.eventRegistration.update({
        where: { id: registration.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      await tx.$executeRaw`
        UPDATE "Event"
        SET "registeredCount" = GREATEST("registeredCount" - 1, 0)
        WHERE "id" = ${eventId}
      `;
    });

    await createNotification({
      userId,
      title: 'Registration Cancelled',
      message: `Your registration for "${registration.event.title}" has been cancelled and seat released.`,
      type: 'REGISTRATION_CANCELLED',
      linkUrl: `/student/events`,
    });

    return sendSuccess(res, 'Registration cancelled successfully.');
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const registrations = await prisma.eventRegistration.findMany({
      where: { userId, status: 'REGISTERED' },
      include: {
        event: {
          include: {
            club: { select: { id: true, name: true, slug: true, logoUrl: true } },
          },
        },
      },
      orderBy: { event: { startDateTime: 'asc' } },
    });

    return sendSuccess(res, 'Your registered events', registrations);
  } catch (error) {
    next(error);
  }
};

export const getEventParticipants = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;

    const participants = await prisma.eventRegistration.findMany({
      where: { eventId },
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
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    // Check attendance status for each participant
    const attendances = await prisma.attendance.findMany({
      where: { eventId },
      select: { userId: true, checkInTime: true, method: true },
    });

    const attendanceMap = new Map();
    attendances.forEach((a) => attendanceMap.set(a.userId, a));

    const enrichedParticipants = participants.map((p) => ({
      ...p,
      attendance: attendanceMap.get(p.userId) || null,
    }));

    return sendSuccess(res, 'Participants list retrieved', enrichedParticipants);
  } catch (error) {
    next(error);
  }
};

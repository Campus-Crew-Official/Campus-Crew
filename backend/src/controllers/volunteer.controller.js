import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification, createBulkNotifications } from '../services/notification.service.js';

export const createOpportunity = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { roleTitle, description, skillsRequired, volunteersNeeded } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { club: true },
    });

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    const opportunity = await prisma.volunteerOpportunity.create({
      data: {
        eventId,
        roleTitle,
        description,
        skillsRequired,
        volunteersNeeded: parseInt(volunteersNeeded),
        status: 'OPEN',
      },
    });

    // Notify club members about volunteer opening
    const clubMembers = await prisma.clubMembership.findMany({
      where: { clubId: event.clubId, status: 'ACTIVE' },
      select: { userId: true },
    });

    const notifications = clubMembers.map((m) => ({
      userId: m.userId,
      title: `Volunteer Call: ${roleTitle} 🤝`,
      message: `${event.club.name} is looking for volunteers for "${event.title}". Apply now!`,
      type: 'VOLUNTEER_OPEN',
      linkUrl: `/events/${event.slug}`,
    }));

    await createBulkNotifications(notifications);

    return sendSuccess(res, 'Volunteer opportunity created successfully!', opportunity, 201);
  } catch (error) {
    next(error);
  }
};

export const getOpportunitiesByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const opportunities = await prisma.volunteerOpportunity.findMany({
      where: { eventId },
      include: {
        applications: {
          include: {
            user: { select: { id: true, name: true, rollNumber: true, department: true, email: true, phone: true } },
          },
        },
        assignments: {
          include: {
            user: { select: { id: true, name: true, rollNumber: true, phone: true } },
            backupUser: { select: { id: true, name: true, rollNumber: true } },
          },
        },
        _count: { select: { applications: true, assignments: true } },
      },
    });

    return sendSuccess(res, 'Volunteer opportunities retrieved', opportunities);
  } catch (error) {
    next(error);
  }
};

export const applyForOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const userId = req.user.id;
    const { note } = req.body;

    const opp = await prisma.volunteerOpportunity.findUnique({
      where: { id: opportunityId },
      include: { event: true },
    });

    if (!opp || opp.status === 'CLOSED') {
      return sendError(res, 'This volunteer opportunity is no longer open.', 400);
    }

    const existing = await prisma.volunteerApplication.findUnique({
      where: { opportunityId_userId: { opportunityId, userId } },
    });

    if (existing) {
      return sendError(res, 'You have already applied for this volunteer role.', 409);
    }

    const application = await prisma.volunteerApplication.create({
      data: {
        opportunityId,
        userId,
        note,
        status: 'PENDING',
      },
    });

    await createNotification({
      userId,
      title: 'Volunteer Application Submitted! 🤝',
      message: `Your volunteer application for "${opp.roleTitle}" (${opp.event.title}) has been received.`,
      type: 'VOLUNTEER_STATUS',
      linkUrl: `/student/volunteer-tasks`,
    });

    return sendSuccess(res, 'Volunteer application submitted successfully!', application, 201);
  } catch (error) {
    next(error);
  }
};

export const assignVolunteer = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const { applicationId, roleName, reportingTime, reportingVenue, notes } = req.body;

    const application = await prisma.volunteerApplication.findUnique({
      where: { id: applicationId },
      include: {
        opportunity: { include: { event: true } },
        user: true,
      },
    });

    if (!application) {
      return sendError(res, 'Application not found.', 404);
    }

    const eventId = application.opportunity.eventId;
    const userId = application.userId;

    // Create or update assignment
    const assignment = await prisma.volunteerAssignment.upsert({
      where: { eventId_userId: { eventId, userId } },
      update: {
        opportunityId,
        roleName,
        reportingTime: new Date(reportingTime),
        reportingVenue,
        notes,
        status: 'ASSIGNED',
      },
      create: {
        opportunityId,
        eventId,
        userId,
        roleName,
        reportingTime: new Date(reportingTime),
        reportingVenue,
        notes,
        status: 'ASSIGNED',
      },
    });

    // Mark application accepted
    await prisma.volunteerApplication.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED', reviewedAt: new Date() },
    });

    // Notify volunteer
    await createNotification({
      userId,
      title: `Volunteer Assignment Confirmed! 🌟`,
      message: `You are assigned as "${roleName}" for "${application.opportunity.event.title}". Reporting: ${new Date(reportingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at ${reportingVenue}.`,
      type: 'VOLUNTEER_STATUS',
      linkUrl: `/student/volunteer-tasks`,
    });

    return sendSuccess(res, 'Volunteer assigned successfully!', assignment);
  } catch (error) {
    next(error);
  }
};

export const requestReplacement = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const assignment = await prisma.volunteerAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        event: { include: { createdBy: true } },
        user: true,
      },
    });

    if (!assignment || assignment.userId !== userId) {
      return sendError(res, 'Volunteer assignment not found for this user.', 404);
    }

    const updated = await prisma.volunteerAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'REPLACEMENT_REQUESTED',
        notes: assignment.notes ? `${assignment.notes} | Replacement requested: ${reason}` : `Replacement requested: ${reason}`,
      },
    });

    // Notify coordinator
    await createNotification({
      userId: assignment.event.createdById,
      title: `Volunteer Replacement Needed ⚠️`,
      message: `${assignment.user.name} reported unavailability for "${assignment.roleName}" in "${assignment.event.title}". Reason: ${reason}`,
      type: 'VOLUNTEER_REPLACEMENT',
      linkUrl: `/coordinator/events/${assignment.eventId}/volunteers`,
    });

    return sendSuccess(res, 'Replacement request submitted to coordinator.', updated);
  } catch (error) {
    next(error);
  }
};

export const getMyVolunteerAssignments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [assignments, applications] = await Promise.all([
      prisma.volunteerAssignment.findMany({
        where: { userId },
        include: {
          event: {
            include: {
              club: { select: { id: true, name: true, slug: true, logoUrl: true } },
            },
          },
        },
        orderBy: { reportingTime: 'asc' },
      }),
      prisma.volunteerApplication.findMany({
        where: { userId },
        include: {
          opportunity: {
            include: {
              event: {
                select: { id: true, title: true, slug: true, startDateTime: true, venue: true },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      }),
    ]);

    return sendSuccess(res, 'Your volunteer assignments and applications', {
      assignments,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

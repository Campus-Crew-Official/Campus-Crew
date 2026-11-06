import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalClubs,
      pendingClubs,
      totalEvents,
      totalRegistrations,
      totalPointsAwarded,
      recentUsers,
      recentEvents,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.club.count({ where: { status: 'APPROVED' } }),
      prisma.club.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.event.count(),
      prisma.eventRegistration.count({ where: { status: 'REGISTERED' } }),
      prisma.contribution.aggregate({ _sum: { points: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, department: true, createdAt: true },
      }),
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { club: { select: { name: true } } },
      }),
    ]);

    return sendSuccess(res, 'Admin analytics loaded', {
      totalStudents,
      totalClubs,
      pendingClubs,
      totalEvents,
      totalRegistrations,
      totalPoints: totalPointsAwarded._sum.points || 0,
      recentUsers,
      recentEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoordinatorStats = async (req, res, next) => {
  try {
    const { clubId } = req.params;

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
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

    const [
      pendingApplications,
      upcomingEvents,
      tasksStats,
      totalRegistrations,
      attendancesCount,
    ] = await Promise.all([
      prisma.recruitmentApplication.count({
        where: { drive: { clubId }, status: 'PENDING' },
      }),
      prisma.event.findMany({
        where: { clubId, startDateTime: { gte: new Date() } },
        orderBy: { startDateTime: 'asc' },
        take: 5,
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { event: { clubId } },
        _count: { id: true },
      }),
      prisma.eventRegistration.count({
        where: { event: { clubId }, status: 'REGISTERED' },
      }),
      prisma.attendance.count({
        where: { event: { clubId } },
      }),
    ]);

    const taskCountMap = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      VERIFIED: 0,
      BLOCKED: 0,
    };
    tasksStats.forEach((t) => {
      taskCountMap[t.status] = t._count.id;
    });

    return sendSuccess(res, 'Coordinator dashboard analytics', {
      club,
      totalMembers: club._count.members,
      totalEvents: club._count.events,
      pendingApplications,
      totalRegistrations,
      totalAttendances: attendancesCount,
      tasks: taskCountMap,
      upcomingEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const exportEventReportCsv = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
        registrations: {
          include: {
            user: { select: { name: true, rollNumber: true, email: true, department: true, year: true, phone: true } },
          },
        },
        attendances: true,
        tasks: {
          include: {
            assignedToUser: { select: { name: true, rollNumber: true } },
          },
        },
      },
    });

    if (!event) {
      return sendError(res, 'Event not found', 404);
    }

    const attendanceMap = new Set(event.attendances.map((a) => a.userId));

    // Build CSV string
    const headers = 'Ticket Code,Student Name,Roll Number,Email,Department,Year,Phone,Status,Attendance\n';
    const rows = event.registrations
      .map((r) => {
        const attended = attendanceMap.has(r.userId) ? 'ATTENDED' : 'ABSENT';
        return `"${r.ticketCode}","${r.user.name}","${r.user.rollNumber}","${r.user.email}","${r.user.department}",${r.user.year},"${r.user.phone || ''}","${r.status}","${attended}"`;
      })
      .join('\n');

    const csvContent = headers + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="event-report-${event.slug}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

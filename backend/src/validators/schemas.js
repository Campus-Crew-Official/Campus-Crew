import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid institutional email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  rollNumber: z.string().min(2, 'Roll number is required'),
  department: z.string().min(2, 'Department is required'),
  year: z.coerce.number().min(1).max(5).default(1),
  phone: z.string().optional(),
  role: z.enum(['STUDENT', 'COORDINATOR']).default('STUDENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid institutional email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  year: z.coerce.number().min(1).max(5).optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const createClubSchema = z.object({
  name: z.string().min(3, 'Club name must be at least 3 characters'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'ACADEMIC', 'ENTREPRENEURSHIP', 'OTHER']),
  facultyCoordinator: z.string().min(3, 'Faculty coordinator is required'),
  contactEmail: z.string().email('Valid contact email is required'),
  contactPhone: z.string().optional().nullable().or(z.literal('')),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
  bannerUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export const updateClubSchema = createClubSchema.partial();

export const createDriveSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description is required'),
  requirements: z.string().min(5, 'Requirements are required'),
  deadline: z.string().or(z.date()),
});

export const applyDriveSchema = z.object({
  statementOfPurpose: z.string().min(15, 'Statement of purpose must be at least 15 characters'),
  experience: z.string().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export const updateAppStatusSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED']),
  reviewNotes: z.string().optional().nullable(),
});

export const createEventSchema = z.object({
  clubId: z.string().min(1, 'Club ID is required'),
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be URL friendly'),
  description: z.string().min(10, 'Description is required'),
  category: z.enum(['WORKSHOP', 'SEMINAR', 'COMPETITION', 'CULTURAL_FEST', 'SPORTS', 'HACKATHON', 'SOCIAL_CAUSE', 'MEETUP']),
  venue: z.string().min(2, 'Venue is required'),
  startDateTime: z.string().or(z.date()),
  endDateTime: z.string().or(z.date()),
  registrationStartDate: z.string().or(z.date()),
  registrationEndDate: z.string().or(z.date()),
  maxCapacity: z.coerce.number().min(1, 'Max capacity must be at least 1'),
  bannerUrl: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED']).default('PUBLISHED'),
});

export const updateEventSchema = createEventSchema.partial();

export const createVolunteerOppSchema = z.object({
  roleTitle: z.string().min(3, 'Role title is required'),
  description: z.string().min(10, 'Description is required'),
  skillsRequired: z.string().optional().nullable(),
  volunteersNeeded: z.coerce.number().min(1, 'Must request at least 1 volunteer'),
});

export const applyVolunteerSchema = z.object({
  note: z.string().optional().nullable(),
});

export const assignVolunteerSchema = z.object({
  applicationId: z.string().min(1),
  roleName: z.string().min(2),
  reportingTime: z.string().or(z.date()),
  reportingVenue: z.string().min(2),
  notes: z.string().optional().nullable(),
});

export const createTaskSchema = z.object({
  assignedToUserId: z.string().min(1, 'Assignee is required'),
  title: z.string().min(3, 'Task title is required'),
  description: z.string().min(5, 'Task description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  deadline: z.string().or(z.date()),
  pointsValue: z.coerce.number().min(1).default(5),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'VERIFIED']),
});

export const taskCommentSchema = z.object({
  comment: z.string().min(1, 'Comment text cannot be empty'),
});

export const createAnnouncementSchema = z.object({
  clubId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(5, 'Content is required'),
  targetRole: z.enum(['ALL', 'MEMBERS', 'VOLUNTEERS']).default('ALL'),
  isPinned: z.boolean().default(false),
});

export const qrCheckInSchema = z.object({
  ticketCode: z.string().min(5, 'Ticket code is required'),
  checkInSecret: z.string().min(5, 'Check-in secret is required'),
});

export const manualAttendanceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const manualContributionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  clubId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  points: z.coerce.number().min(1, 'Points must be at least 1'),
  reason: z.string().min(5, 'Reason is required'),
  category: z.enum(['VOLUNTEER_WORK', 'TASK_COMPLETION', 'COORDINATION', 'OTHER']).default('OTHER'),
});

export const updatePreferenceSchema = z.object({
  emailEventReminders: z.boolean().optional(),
  emailTaskUpdates: z.boolean().optional(),
  emailRecruitment: z.boolean().optional(),
  inAppAnnouncements: z.boolean().optional(),
  inAppTasks: z.boolean().optional(),
  inAppEvents: z.boolean().optional(),
});

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/db.js';
import { signToken } from '../utils/jwt.js';

describe('Club, Task & Attendance API Integration Tests', () => {
  let adminToken, coordinatorToken, studentToken;
  let coordinatorUser, studentUser;
  let testClub, testEvent, testTask;

  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@campuscrew.edu' } });
    coordinatorUser = await prisma.user.findUnique({ where: { email: 'coordinator@campuscrew.edu' } });
    studentUser = await prisma.user.findUnique({ where: { email: 'student@campuscrew.edu' } });

    adminToken = signToken({ userId: admin.id, role: admin.role, email: admin.email });
    coordinatorToken = signToken({ userId: coordinatorUser.id, role: coordinatorUser.role, email: coordinatorUser.email });
    studentToken = signToken({ userId: studentUser.id, role: studentUser.role, email: studentUser.email });

    testClub = await prisma.club.findFirst({ where: { slug: 'software-development-club' } });
    testEvent = await prisma.event.findFirst({ where: { clubId: testClub.id } });
  });

  it('GET /api/clubs should return approved clubs with counts', async () => {
    const res = await request(app).get('/api/clubs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/clubs/:identifier should return complete club profile and members', async () => {
    const res = await request(app).get(`/api/clubs/${testClub.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(testClub.name);
    expect(Array.isArray(res.body.data.members)).toBe(true);
  });

  it('POST /api/tasks/events/:eventId creates a task', async () => {
    const res = await request(app)
      .post(`/api/tasks/events/${testEvent.id}`)
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send({
        assignedToUserId: studentUser.id,
        title: 'Integration Test Task: Setup projector',
        description: 'Check HDMI cables and power cords',
        priority: 'MEDIUM',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        pointsValue: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Integration Test Task: Setup projector');
    testTask = res.body.data;
  });

  it('PATCH /api/tasks/:id/status updates status to COMPLETED by volunteer', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${testTask.id}/status`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('PATCH /api/tasks/:id/verify verifies task and awards contribution points', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${testTask.id}/verify`)
      .set('Authorization', `Bearer ${coordinatorToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('points awarded');

    // Verify contribution entry in DB
    const contribution = await prisma.contribution.findFirst({
      where: {
        userId: studentUser.id,
        category: 'TASK_COMPLETION',
        reason: { contains: testTask.title },
      },
    });
    expect(contribution).toBeDefined();
    expect(contribution.points).toBe(10);
  });

  it('GET /api/contributions/leaderboard returns ranked students', async () => {
    const res = await request(app).get('/api/contributions/leaderboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].rank).toBe(1);
    expect(res.body.data[0].totalPoints).toBeGreaterThan(0);
  });
});

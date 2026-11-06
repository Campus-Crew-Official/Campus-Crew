import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';

describe('Concurrency & Data Consistency Verification Tests', () => {
  let testClub;
  let limitedEvent;
  let testUsers = [];
  let userTokens = [];

  beforeAll(async () => {
    // 1. Get or create test club
    testClub = await prisma.club.findFirst();

    // 2. Create an event with capacity = 5, already having 4 registered users (1 seat remaining!)
    limitedEvent = await prisma.event.create({
      data: {
        clubId: testClub.id,
        createdById: testClub.studentCoordinatorId || (await prisma.user.findFirst()).id,
        title: 'High-Concurrency Registration Stress Event',
        slug: `concurrency-event-${Date.now()}`,
        description: 'Test event to verify atomic capacity lock and race condition prevention',
        venue: 'Concurrency Lab',
        startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDateTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        registrationStartDate: new Date(Date.now() - 60 * 60 * 1000),
        registrationEndDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        maxCapacity: 5,
        registeredCount: 4, // Exactly 1 seat remaining!
        status: 'REGISTRATION_OPEN',
      },
    });

    // 3. Create 20 unique students for the concurrency test
    const passwordHash = await bcrypt.hash('TestPass123!', 10);
    const usersData = Array.from({ length: 20 }, (_, i) => ({
      email: `concurrent_tester_${Date.now()}_${i}@campuscrew.edu`,
      passwordHash,
      name: `Concurrent Tester ${i}`,
      rollNumber: `CONC-${Date.now()}-${i}`,
      department: 'Computer Science',
      year: 2,
      role: 'STUDENT',
      status: 'ACTIVE',
    }));

    await prisma.user.createMany({ data: usersData });

    testUsers = await prisma.user.findMany({
      where: { email: { contains: 'concurrent_tester_' } },
    });

    userTokens = testUsers.map((u) => signToken({ userId: u.id, role: u.role, email: u.email }));
  });

  afterAll(async () => {
    // Cleanup
    if (limitedEvent) {
      await prisma.eventRegistration.deleteMany({ where: { eventId: limitedEvent.id } });
      await prisma.event.delete({ where: { id: limitedEvent.id } });
    }
    if (testUsers.length > 0) {
      const ids = testUsers.map((u) => u.id);
      await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
      await prisma.notificationPreference.deleteMany({ where: { userId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
  });

  it('20 concurrent requests for 1 remaining seat: exactly 1 succeeds, 19 fail with 409, capacity never exceeded', async () => {
    // Launch all 20 registration requests simultaneously
    const registrationPromises = userTokens.map((token) =>
      request(app)
        .post(`/api/events/${limitedEvent.id}/register`)
        .set('Authorization', `Bearer ${token}`)
        .send()
    );

    const responses = await Promise.all(registrationPromises);

    const successful = responses.filter((r) => r.status === 201);
    const rejectedCapacity = responses.filter((r) => r.status === 409);

    console.log(`[Concurrency Test Result] Total requests: 20, Successful (201): ${successful.length}, Rejected (409): ${rejectedCapacity.length}`);

    // EXACTLY 1 must succeed
    expect(successful.length).toBe(1);
    // The other 19 must receive 409 Conflict
    expect(rejectedCapacity.length).toBe(19);

    // Verify DB integrity directly
    const finalEvent = await prisma.event.findUnique({
      where: { id: limitedEvent.id },
    });

    // Registered count must strictly equal 5 (maxCapacity) and NEVER 6 or 24!
    expect(finalEvent.registeredCount).toBe(5);
    expect(finalEvent.registeredCount).toBeLessThanOrEqual(finalEvent.maxCapacity);

    // Total actual registration records created for this event from this batch must be 1
    const newRegistrationsCount = await prisma.eventRegistration.count({
      where: {
        eventId: limitedEvent.id,
        userId: { in: testUsers.map((u) => u.id) },
        status: 'REGISTERED',
      },
    });
    expect(newRegistrationsCount).toBe(1);
  });

  it('Duplicate registration prevention: same user cannot register twice', async () => {
    const winnerUser = testUsers[0];
    const winnerToken = userTokens[0];

    // Try registering again with the user who got in
    const duplicateRes = await request(app)
      .post(`/api/events/${limitedEvent.id}/register`)
      .set('Authorization', `Bearer ${winnerToken}`)
      .send();

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });
});

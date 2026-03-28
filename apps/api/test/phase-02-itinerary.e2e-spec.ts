import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Phase 02 Itinerary API — E2E Tests
 *
 * These tests cover the end-to-end flow of itinerary management:
 * 1. Leader creates trip and itinerary items
 * 2. Member fetches read-only itinerary
 * 3. Member submits proposal
 * 4. Leader accepts proposal
 * 5. Reorder persists in later GET responses
 */
describe('Phase 02 Itinerary API', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Test tokens and IDs
  let leaderToken: string;
  let memberToken: string;
  let tripId: string;
  let joinCode: string;
  let itemId: string;
  let proposalId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Setup: Create users and trip', () => {
    it('should register a leader user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'leader-e2e@test.com',
          password: 'Test12345!',
          name: 'Leader E2E',
        });

      // Either 201 for new user or handle existing
      if (res.status === 201) {
        leaderToken = res.body.accessToken;
      } else {
        // Login if already exists
        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'leader-e2e@test.com',
            password: 'Test12345!',
          });
        leaderToken = loginRes.body.accessToken;
      }
      expect(leaderToken).toBeDefined();
    });

    it('should register a member user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'member-e2e@test.com',
          password: 'Test12345!',
          name: 'Member E2E',
        });

      if (res.status === 201) {
        memberToken = res.body.accessToken;
      } else {
        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'member-e2e@test.com',
            password: 'Test12345!',
          });
        memberToken = loginRes.body.accessToken;
      }
      expect(memberToken).toBeDefined();
    });

    it('should create a trip', async () => {
      const res = await request(app.getHttpServer())
        .post('/trips')
        .set('Authorization', `Bearer ${leaderToken}`)
        .send({
          name: 'E2E Test Trip',
          destination: 'Da Nang',
          startDate: '2026-05-01',
          endDate: '2026-05-05',
        })
        .expect(201);

      tripId = res.body.id;
      joinCode = res.body.joinCode;
      expect(tripId).toBeDefined();
    });

    it('should have member join the trip', async () => {
      await request(app.getHttpServer())
        .post(`/trips/${joinCode}/join`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(201);
    });
  });

  describe('Itinerary CRUD (Leader)', () => {
    it('POST /trips/:tripId/itinerary/items — should create items', async () => {
      const res = await request(app.getHttpServer())
        .post(`/trips/${tripId}/itinerary/items`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .send({
          title: 'Visit Marble Mountains',
          dayIndex: 0,
          startTime: '09:00',
          locationName: 'Marble Mountains',
          lat: 16.004,
          lng: 108.262,
        })
        .expect(201);

      expect(res.body.totalItems).toBe(1);
      expect(res.body.days[0].items[0].title).toBe('Visit Marble Mountains');
      expect(res.body.days[0].items[0].startTime).toBe('09:00');
      itemId = res.body.days[0].items[0].id;
    });

    it('GET /trips/:tripId/itinerary — should return snapshot', async () => {
      const res = await request(app.getHttpServer())
        .get(`/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .expect(200);

      expect(res.body.isLeader).toBe(true);
      expect(res.body.canEdit).toBe(true);
      expect(res.body.days).toHaveLength(1);
    });
  });

  describe('Member Read-Only Access', () => {
    it('GET /trips/:tripId/itinerary — member sees read-only snapshot', async () => {
      const res = await request(app.getHttpServer())
        .get(`/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(res.body.isLeader).toBe(false);
      expect(res.body.canEdit).toBe(false);
      expect(res.body.days).toHaveLength(1);
    });

    it('POST /trips/:tripId/itinerary/items — member cannot create items', async () => {
      await request(app.getHttpServer())
        .post(`/trips/${tripId}/itinerary/items`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Unauthorized Item',
          dayIndex: 0,
        })
        .expect(403);
    });
  });

  describe('Proposal Flow', () => {
    it('POST /trips/:tripId/proposals — member submits a proposal', async () => {
      const res = await request(app.getHttpServer())
        .post(`/trips/${tripId}/proposals`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          type: 'UPDATE_TIME',
          targetItemId: itemId,
          payload: { startMinute: 600 },
          baseVersion: 1,
        })
        .expect(201);

      proposalId = res.body.id;
      expect(res.body.status).toBe('PENDING');
    });

    it('POST /trips/:tripId/proposals/:id/accept — leader accepts proposal', async () => {
      const res = await request(app.getHttpServer())
        .post(`/trips/${tripId}/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .expect(201);

      expect(res.body.status).toBe('ACCEPTED');
    });
  });

  describe('Reorder Persistence', () => {
    let secondItemId: string;

    it('should create a second item', async () => {
      const res = await request(app.getHttpServer())
        .post(`/trips/${tripId}/itinerary/items`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .send({
          title: 'Lunch at Hoi An',
          dayIndex: 0,
          startTime: '12:00',
          locationName: 'Hoi An Ancient Town',
        })
        .expect(201);

      secondItemId = res.body.days[0].items[1].id;
    });

    it('POST /trips/:tripId/itinerary/reorder — should reorder items', async () => {
      await request(app.getHttpServer())
        .post(`/trips/${tripId}/itinerary/reorder`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .send({
          items: [
            { itemId: secondItemId, dayIndex: 0, sortOrder: 1 },
            { itemId: itemId, dayIndex: 0, sortOrder: 2 },
          ],
        })
        .expect(201);
    });

    it('GET /trips/:tripId/itinerary — reordered items persist', async () => {
      const res = await request(app.getHttpServer())
        .get(`/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .expect(200);

      const day0Items = res.body.days[0].items;
      expect(day0Items[0].id).toBe(secondItemId);
      expect(day0Items[1].id).toBe(itemId);
      expect(day0Items[0].sortOrder).toBe(1);
      expect(day0Items[1].sortOrder).toBe(2);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(30000);

describe('Phase 05 Deep AI Integration API', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let leaderToken: string;
  let memberToken: string;
  let tripId: string;
  let joinCode: string;
  let memberUserId: string;
  let foodItemIds: string[] = [];

  const now = Date.now();
  const leaderEmail = `phase05-leader-${now}@test.com`;
  const memberEmail = `phase05-member-${now}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    const leaderRes = await request(app.getHttpServer()).post('/auth/register').send({
      email: leaderEmail,
      password: 'Test12345!',
      name: 'Leader Phase 05',
    });
    leaderToken = leaderRes.body.accessToken;

    const memberRes = await request(app.getHttpServer()).post('/auth/register').send({
      email: memberEmail,
      password: 'Test12345!',
      name: 'Member Phase 05',
    });
    memberToken = memberRes.body.accessToken;

    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        name: 'AI Deep Integration Trip',
        destination: 'Da Nang',
        startDate: '2026-06-01',
        endDate: '2026-06-03',
      })
      .expect(201);

    tripId = tripRes.body.id;
    joinCode = tripRes.body.joinCode;

    await request(app.getHttpServer())
      .post(`/trips/${joinCode}/join`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);

    const memberUser = await prisma.user.findUniqueOrThrow({
      where: { email: memberEmail },
      select: { id: true },
    });
    memberUserId = memberUser.id;

    await prisma.user.update({
      where: { id: memberUserId },
      data: {
        healthProfile: 'co the di ung hai san, can xem lai truoc khi an',
      },
    });

    const items = [
      {
        title: 'Bun cha ca',
        dayIndex: 0,
        startTime: '09:00',
        locationName: 'Quan A',
        lat: 16.051,
        lng: 108.221,
      },
      {
        title: 'Tra sua pho bien',
        dayIndex: 0,
        startTime: '11:00',
        locationName: 'Quan B',
        lat: 16.052,
        lng: 108.223,
      },
      {
        title: 'Hai san tuoi song',
        dayIndex: 0,
        startTime: '13:00',
        locationName: 'Quan C',
        lat: 16.06,
        lng: 108.233,
      },
    ];

    for (const item of items) {
      const res = await request(app.getHttpServer())
        .post(`/trips/${tripId}/itinerary/items`)
        .set('Authorization', `Bearer ${leaderToken}`)
        .send(item)
        .expect(201);
      foodItemIds = res.body.days[0].items.map((createdItem: { id: string }) => createdItem.id);
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('health warnings: downgrades ambiguous profile parsing to Can xem lai', async () => {
    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(res.body.healthWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: expect.any(String),
          severity: 'CAN_XEM_LAI',
          title: 'Can xem lai',
          confidenceLabel: 'Can xem lai',
          affectedMemberIds: [memberUserId],
        }),
      ]),
    );
  });

  it('culinary route non-mutation: suggest returns a draft without rewriting itinerary order', async () => {
    const before = await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    const suggested = await request(app.getHttpServer())
      .post(`/trips/${tripId}/itinerary/culinary-route/suggest`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        itemIds: foodItemIds,
      })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(suggested.body.suggestionId).toContain(`culinary-${tripId}-`);
    expect(suggested.body.orderedItems).toHaveLength(3);
    expect(suggested.body.confidenceLabel).toBe('Goi y');
    expect(suggested.body.orderedItems[1].reason).toContain('phut di chuyen');
    expect(after.body.days[0].items.map((item: { id: string }) => item.id)).toEqual(
      before.body.days[0].items.map((item: { id: string }) => item.id),
    );
  });

  it('culinary route: only the leader can apply reviewed ordering', async () => {
    const suggestion = await request(app.getHttpServer())
      .post(`/trips/${tripId}/itinerary/culinary-route/suggest`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        itemIds: [...foodItemIds].reverse(),
      })
      .expect(201);

    const orderedItemIds = suggestion.body.orderedItems.map(
      (item: { itemId: string }) => item.itemId,
    );

    await request(app.getHttpServer())
      .post(`/trips/${tripId}/itinerary/culinary-route/apply`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        orderedItemIds,
        sourceSuggestionId: suggestion.body.suggestionId,
      })
      .expect(403);

    const applied = await request(app.getHttpServer())
      .post(`/trips/${tripId}/itinerary/culinary-route/apply`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        orderedItemIds,
        sourceSuggestionId: suggestion.body.suggestionId,
      })
      .expect(201);

    const finalIds = applied.body.days[0].items.map((item: { id: string }) => item.id);
    expect(finalIds.slice(-orderedItemIds.length)).toEqual(orderedItemIds);
  });
});

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
  let memberTripMemberId: string;

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

    const memberTripMember = await prisma.tripMember.findUniqueOrThrow({
      where: {
        userId_tripId: {
          userId: (await prisma.user.findUniqueOrThrow({
            where: { email: memberEmail },
            select: { id: true },
          })).id,
          tripId,
        },
      },
      select: { id: true },
    });
    memberTripMemberId = memberTripMember.id;

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

    const fundRes = await request(app.getHttpServer())
      .post(`/trips/${tripId}/fund`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        targetAmount: '5000000',
        currency: 'VND',
      })
      .expect(201);

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

  it('forwarding config: returns the trip-specific booking address', async () => {
    const res = await request(app.getHttpServer())
      .get(`/trips/${tripId}/booking-import/config`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(res.body.forwardingAddress).toBe(`booking+${joinCode}@minhdidauthe.local`);
    expect(res.body.manualPasteEnabled).toBe(true);
  });

  it('booking import draft: manual creation stores a draft without creating itinerary items', async () => {
    const before = await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    const created = await request(app.getHttpServer())
      .post(`/trips/${tripId}/booking-import/drafts`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        rawContent: 'Flight VN123 du kien 08:30. Cho xac nhan.',
        sourceSubject: 'Forward ve may bay',
      })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get(`/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(created.body.createdByTripMemberId).toBe(memberTripMemberId);
    expect(created.body.status).toBe('DRAFT');
    expect(created.body.confidenceLabel).toBe('Can xem lai');
    expect(created.body.parseSummary).toContain('can xem lai');
    expect(after.body.totalItems).toBe(before.body.totalItems);
  });

  it('booking import forwarding: inbound endpoint creates a reviewable draft', async () => {
    const created = await request(app.getHttpServer())
      .post('/booking-import/inbound')
      .send({
        recipientAddress: `booking+${joinCode}@minhdidauthe.local`,
        rawContent: 'Khach san tai My Khe 14:00 ABC123',
        sourceSender: 'hotel@example.com',
        sourceSubject: 'Xac nhan dat phong',
      })
      .expect(201);

    expect(created.body.sourceChannel).toBe('FORWARDED_EMAIL');
    expect(created.body.forwardingAddress).toBe(`booking+${joinCode}@minhdidauthe.local`);
    expect(created.body.parsedItems[0].rawExcerpt).toContain('Khach san');
  });

  it('booking import low-confidence parsing: keeps missing fields editable in the stored draft payload', async () => {
    const created = await request(app.getHttpServer())
      .post(`/trips/${tripId}/booking-import/drafts`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        rawContent: 'Xe dua don co the roi som, pending ma dat cho',
      })
      .expect(201);

    expect(created.body.confidenceLabel).toBe('Can xem lai');
    expect(created.body.parsedItems[0].missingFields).toEqual(
      expect.arrayContaining(['locationName', 'startTime', 'bookingCode']),
    );
  });

  it('booking import confirm: only the leader can materialize a draft into itinerary items', async () => {
    const created = await request(app.getHttpServer())
      .post(`/trips/${tripId}/booking-import/drafts`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        rawContent: 'Khach san tai My Khe 14:00 ABC123',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/trips/${tripId}/booking-import/drafts/${created.body.id}/confirm`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({})
      .expect(403);

    const confirmed = await request(app.getHttpServer())
      .post(`/trips/${tripId}/booking-import/drafts/${created.body.id}/confirm`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({})
      .expect(201);

    expect(confirmed.body.draft.status).toBe('CONFIRMED');
    expect(confirmed.body.snapshot.totalItems).toBeGreaterThan(foodItemIds.length);
  });

  it('local expert menu: returns structured menu cards with uncertainty labels when ingredients are unclear', async () => {
    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/local-expert/menu-translate`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        menuText: 'Muc nuong sa',
      })
      .expect(201);

    expect(res.body.cards).toEqual([
      expect.objectContaining({
        originalText: 'Muc nuong sa',
        translatedText: expect.any(String),
        cautionNote: expect.stringContaining('Can xem lai'),
        confidenceLabel: 'Can xem lai',
        nextAction: expect.any(String),
      }),
    ]);
  });

  it('hidden spot local expert: returns up to three short suggestion cards', async () => {
    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/local-expert/hidden-spots`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        areaLabel: 'Hai Chau',
        vibe: 'yen tinh',
        budgetHint: 're',
      })
      .expect(201);

    expect(res.body.cards).toHaveLength(3);
    expect(res.body.cards[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        whyItFits: expect.any(String),
        nextAction: expect.any(String),
      }),
    );
  });

  it('local expert outfit: keeps the planner capped at three cards', async () => {
    const res = await request(app.getHttpServer())
      .post(`/trips/${tripId}/local-expert/outfit-plan`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        dayIndex: 1,
        aestheticHint: 'noi bat',
        weatherLabel: 'mua nhe',
        activityLabels: ['di bo', 'an toi'],
      })
      .expect(201);

    expect(res.body.cards).toHaveLength(3);
    expect(res.body.cards[2].confidenceLabel).toBe('Can xem lai');
  });

  it('daily podcast recap: generates one persisted recap per day with browser fallback metadata', async () => {
    const generated = await request(app.getHttpServer())
      .post(`/trips/${tripId}/daily-podcast/0/generate`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        tone: 'playful',
      })
      .expect(201);

    const fetched = await request(app.getHttpServer())
      .get(`/trips/${tripId}/daily-podcast/0`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(generated.body.title).toBe('Podcast ngay 1');
    expect(generated.body.audioMode).toBe('BROWSER_TTS');
    expect(generated.body.audioUrl).toBeNull();
    expect(generated.body.durationSeconds).toBeLessThanOrEqual(120);
    expect(fetched.body.recap.id).toBe(generated.body.id);
  });

  it('daily podcast recap: keeps one recap per day unless refresh is requested', async () => {
    const first = await request(app.getHttpServer())
      .post(`/trips/${tripId}/daily-podcast/1/generate`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        tone: 'playful',
      })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post(`/trips/${tripId}/daily-podcast/1/generate`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        tone: 'playful',
      })
      .expect(201);

    const storedCount = await prisma.dailyPodcastRecap.count({
      where: {
        tripId,
        dayIndex: 1,
      },
    });

    expect(second.body.id).toBe(first.body.id);
    expect(storedCount).toBe(1);
  });

  it('daily podcast recap: enforces transcript size guardrails for the generated story', async () => {
    const generated = await request(app.getHttpServer())
      .post(`/trips/${tripId}/daily-podcast/2/generate`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        tone: 'calm',
      })
      .expect(201);

    const words = generated.body.transcript.split(/\s+/).filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(220);
    expect(words.length).toBeLessThanOrEqual(300);
    expect(generated.body.recapText).toContain('BROWSER_TTS');
  });

  it('cost benchmark: keeps normal-range expenses as light LUU_Y guidance', async () => {
    const created = await request(app.getHttpServer())
      .post(`/trips/${tripId}/fund/expenses`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        title: 'Bua trua gan bien',
        amount: '95000',
        category: 'FOOD',
        incurredAt: '2026-06-01T12:00:00.000Z',
        merchantLabel: 'Quan trua',
        quantityHint: '2 nguoi',
      })
      .expect(201);

    const expense = created.body.expenses.find((item: { title: string }) => item.title === 'Bua trua gan bien');
    expect(expense.severity).toBe('LUU_Y');
    expect(expense.benchmarkMedianAmount).toBe('90000');
    expect(expense.confidenceLabel).toBe('Goi y');
  });

  it('cost benchmark: flags clearly overpriced expenses as NGUY_CO_CAO', async () => {
    const created = await request(app.getHttpServer())
      .post(`/trips/${tripId}/fund/expenses`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        title: 'Hai san view dep',
        amount: '260000',
        category: 'FOOD',
        incurredAt: '2026-06-01T19:00:00.000Z',
      })
      .expect(201);

    const expense = created.body.expenses.find((item: { title: string }) => item.title === 'Hai san view dep');
    expect(expense.severity).toBe('NGUY_CO_CAO');
    expect(expense.sourceLabel).toContain('Da Nang');
  });

  it('cost benchmark: returns non-blocking Can xem lai fallback when local data is missing', async () => {
    await request(app.getHttpServer())
      .post(`/trips/${tripId}/fund/expenses`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        title: 'Thuoc du phong',
        amount: '500000',
        category: 'EMERGENCY',
        incurredAt: '2026-06-02T08:00:00.000Z',
      })
      .expect(201);

    const benchmarks = await request(app.getHttpServer())
      .get(`/trips/${tripId}/fund/cost-benchmarks`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(benchmarks.body.tripId).toBe(tripId);
    expect(benchmarks.body.currency).toBe('VND');
    expect(benchmarks.body.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Thuoc du phong',
          severity: 'CAN_XEM_LAI',
          confidenceLabel: 'Can xem lai',
          note: expect.stringContaining('canh bao mem'),
        }),
      ]),
    );
  });
});

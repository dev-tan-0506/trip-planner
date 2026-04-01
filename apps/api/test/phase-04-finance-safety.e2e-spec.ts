import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 04 Finance Safety API', () => {
  let app: INestApplication;
  let leaderToken: string;
  let memberToken: string;
  let tripId: string;
  let contributionId: string;
  let alertId: string;
  let resolvedAlertId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers leader/member and creates trip', async () => {
    const leader = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'leader-finance-safety@test.com',
      password: 'Test12345!',
      name: 'Leader Finance',
    });

    leaderToken =
      leader.status === 201
        ? leader.body.accessToken
        : (
            await request(app.getHttpServer()).post('/auth/login').send({
              email: 'leader-finance-safety@test.com',
              password: 'Test12345!',
            })
          ).body.accessToken;

    const member = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'member-finance-safety@test.com',
      password: 'Test12345!',
      name: 'Member Finance',
    });

    memberToken =
      member.status === 201
        ? member.body.accessToken
        : (
            await request(app.getHttpServer()).post('/auth/login').send({
              email: 'member-finance-safety@test.com',
              password: 'Test12345!',
            })
          ).body.accessToken;

    const trip = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        name: 'Finance Safety Trip',
        destination: 'Da Nang',
        startDate: '2026-06-10',
        endDate: '2026-06-12',
      })
      .expect(201);

    tripId = trip.body.id;

    await request(app.getHttpServer())
      .post(`/trips/${trip.body.joinCode}/join`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);
  });

  it('runs leader-create, member-contribute, leader-confirm finance flow', async () => {
    const created = await request(app.getHttpServer())
      .post(`/trips/${tripId}/fund`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        targetAmount: '2000000.00',
        currency: 'VND',
        momoQrPayload: { rawText: 'MOMO-QR' },
        bankQrPayload: { rawText: 'BANK-QR' },
      })
      .expect(201);

    expect(created.body.fund.currency).toBe('VND');
    expect(created.body.summary.targetAmount).toBe('2000000');

    const contribution = await request(app.getHttpServer())
      .post(`/trips/${tripId}/fund/contributions`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        declaredAmount: '500000.00',
        method: 'MOMO',
        transferNote: 'Đã chuyển',
      })
      .expect(201);

    contributionId = contribution.body.contributions[0].id;
    expect(contribution.body.contributions[0].status).toBe('PLEDGED');

    const confirmed = await request(app.getHttpServer())
      .post(`/trips/${tripId}/fund/contributions/${contributionId}/confirm`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(201);

    expect(confirmed.body.contributions[0].status).toBe('CONFIRMED');
    expect(confirmed.body.summary.collectedAmount).toBe('500000');
  });

  it('returns safety overview and allows SOS alert flow', async () => {
    const overview = await request(app.getHttpServer())
      .get(`/trips/${tripId}/safety/overview`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    expect(Array.isArray(overview.body.weather)).toBe(true);
    expect(Array.isArray(overview.body.crowd)).toBe(true);
    expect(Array.isArray(overview.body.directoryQuickPicks)).toBe(true);

    const sos = await request(app.getHttpServer())
      .post(`/trips/${tripId}/safety/sos`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ message: 'Mình bị lạc nhóm' })
      .expect(201);

    alertId = sos.body.alerts[0].id;
    expect(sos.body.quickDial.map((item: { phone: string }) => item.phone)).toEqual(
      expect.arrayContaining(['113', '114', '115']),
    );

    const acknowledged = await request(app.getHttpServer())
      .post(`/trips/${tripId}/safety/alerts/${alertId}/acknowledge`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({})
      .expect(201);

    expect(acknowledged.body.alerts[0].status).toBe('ACKNOWLEDGED');
  });

  it('allows resolving an SOS once the situation is safe', async () => {
    const sos = await request(app.getHttpServer())
      .post(`/trips/${tripId}/safety/sos`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ message: 'Đã ổn, chuẩn bị tắt khẩn cấp' })
      .expect(201);

    resolvedAlertId = sos.body.alerts[0].id;

    const resolved = await request(app.getHttpServer())
      .post(`/trips/${tripId}/safety/alerts/${resolvedAlertId}/resolve`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({})
      .expect(201);

    expect(resolved.body.alerts[0].id).toBe(resolvedAlertId);
    expect(resolved.body.alerts[0].status).toBe('RESOLVED');
  });
});

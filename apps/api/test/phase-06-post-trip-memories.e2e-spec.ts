import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Phase 06 Post Trip Memories API', () => {
  let app: INestApplication;
  let leaderToken: string;
  let memberToken: string;
  let tripId: string;
  let memberDocumentId: string;
  let feedbackTripId: string;

  const now = Date.now();
  const leaderEmail = `phase06-leader-${now}@test.com`;
  const memberEmail = `phase06-member-${now}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const leaderRes = await request(app.getHttpServer()).post('/auth/register').send({
      email: leaderEmail,
      password: 'Test12345!',
      name: 'Leader Phase 06',
    });
    leaderToken = leaderRes.body.accessToken;

    const memberRes = await request(app.getHttpServer()).post('/auth/register').send({
      email: memberEmail,
      password: 'Test12345!',
      name: 'Member Phase 06',
    });
    memberToken = memberRes.body.accessToken;

    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        name: 'Memory Tab Trip',
        destination: 'Hội An',
        startDate: '2026-08-01',
        endDate: '2026-08-03',
      })
      .expect(201);

    tripId = tripRes.body.id;

    await request(app.getHttpServer())
      .post(`/trips/${tripRes.body.joinCode}/join`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('vault upload: accepts image and pdf documents for trip members with retention metadata', async () => {
    const uploadRes = await request(app.getHttpServer())
      .post(`/trips/${tripId}/memories/vault/documents`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        documentKind: 'PASSPORT',
        fileName: 'ho-chieu.pdf',
        mimeType: 'application/pdf',
        fileDataUrl: 'data:application/pdf;base64,ZmFrZQ==',
        note: 'Ban scan check-in',
      })
      .expect(201);

    expect(uploadRes.body.tripId).toBe(tripId);
    expect(uploadRes.body.supportedMimeTypes).toEqual(
      expect.arrayContaining(['application/pdf', 'image/jpeg']),
    );
    expect(uploadRes.body.documents).toHaveLength(1);
    expect(uploadRes.body.documents[0]).toEqual(
      expect.objectContaining({
        kind: 'PASSPORT',
        status: 'PENDING_REVIEW',
        mimeType: 'application/pdf',
      }),
    );
    expect(uploadRes.body.retentionLabel).toContain('7 ngày');
    memberDocumentId = uploadRes.body.documents[0].id;
  });

  it('memory tab vault snapshot: keeps members scoped to their own documents while leaders see the group overview', async () => {
    await request(app.getHttpServer())
      .post(`/trips/${tripId}/memories/vault/documents`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        documentKind: 'HOTEL_BOOKING',
        fileName: 'xac-nhan-phong.png',
        mimeType: 'image/png',
        fileDataUrl: 'data:image/png;base64,ZmFrZQ==',
      })
      .expect(201);

    const memberSnapshot = await request(app.getHttpServer())
      .get(`/trips/${tripId}/memories/vault`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    const leaderSnapshot = await request(app.getHttpServer())
      .get(`/trips/${tripId}/memories/vault`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(memberSnapshot.body.isLeader).toBe(false);
    expect(memberSnapshot.body.documents).toHaveLength(1);
    expect(memberSnapshot.body.documents[0].id).toBe(memberDocumentId);

    expect(leaderSnapshot.body.isLeader).toBe(true);
    expect(leaderSnapshot.body.documents).toHaveLength(2);
  });

  it('vault review: only leaders can move a document to READY_FOR_CHECK_IN', async () => {
    await request(app.getHttpServer())
      .patch(`/trips/${tripId}/memories/vault/documents/${memberDocumentId}/review`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'READY_FOR_CHECK_IN' })
      .expect(403);

    const reviewed = await request(app.getHttpServer())
      .patch(`/trips/${tripId}/memories/vault/documents/${memberDocumentId}/review`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({ status: 'READY_FOR_CHECK_IN' })
      .expect(200);

    const reviewedDoc = reviewed.body.documents.find(
      (document: { id: string }) => document.id === memberDocumentId,
    );
    expect(reviewedDoc.status).toBe('READY_FOR_CHECK_IN');
    expect(reviewedDoc.reviewedBy).toEqual(
      expect.objectContaining({
        name: 'Leader Phase 06',
      }),
    );
  });

  it('anonymous feedback: allows one playful submission per member after trip end and hides identity from leader snapshot', async () => {
    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        name: 'Feedback Trip',
        destination: 'Huế',
        startDate: '2026-03-20',
        endDate: '2026-03-22',
      })
      .expect(201);

    feedbackTripId = tripRes.body.id;

    await request(app.getHttpServer())
      .post(`/trips/${tripRes.body.joinCode}/join`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);

    const firstSnapshot = await request(app.getHttpServer())
      .get(`/trips/${feedbackTripId}/memories/feedback`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    expect(firstSnapshot.body.status).toBe('OPEN');
    expect(firstSnapshot.body.canSubmit).toBe(true);

    const submitted = await request(app.getHttpServer())
      .post(`/trips/${feedbackTripId}/memories/feedback/submissions`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        moodScore: 4,
        highlight: 'Bữa tối cuối rất vui',
        wishNextTime: 'Xuất phát sớm hơn một chút',
      })
      .expect(201);

    expect(submitted.body.hasSubmitted).toBe(true);
    expect(submitted.body.canSubmit).toBe(false);

    await request(app.getHttpServer())
      .post(`/trips/${feedbackTripId}/memories/feedback/submissions`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        moodScore: 5,
        highlight: 'Muốn gửi lần hai',
        wishNextTime: 'Không hợp lệ',
      })
      .expect(400);

    const leaderView = await request(app.getHttpServer())
      .get(`/trips/${feedbackTripId}/memories/feedback`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(leaderView.body.submittedCount).toBe(1);
    expect(leaderView.body.responses[0]).toEqual(
      expect.objectContaining({
        moodScore: 4,
        highlight: 'Bữa tối cuối rất vui',
      }),
    );
    expect(JSON.stringify(leaderView.body.responses)).not.toContain('tripMemberId');
  });

  it('anonymous feedback close: only leaders can close the poll and freeze new submissions', async () => {
    await request(app.getHttpServer())
      .post(`/trips/${feedbackTripId}/memories/feedback/close`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);

    const closed = await request(app.getHttpServer())
      .post(`/trips/${feedbackTripId}/memories/feedback/close`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(201);

    expect(closed.body.status).toBe('CLOSED');
  });

  it('souvenir final day: returns authentic location suggestions on the trip end date', async () => {
    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        name: 'Souvenir Final Day Trip',
        destination: 'Đà Nẵng',
        startDate: '2026-04-01',
        endDate: '2026-04-02',
      })
      .expect(201);

    const souvenirs = await request(app.getHttpServer())
      .get(`/trips/${tripRes.body.id}/memories/souvenirs`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(souvenirs.body.eligible).toBe(true);
    expect(souvenirs.body.suggestions[0]).toEqual(
      expect.objectContaining({
        locationName: expect.any(String),
        areaLabel: 'Khu gợi ý 1',
      }),
    );
  });

  it('reunion organizer: exposes recommendedDate, accepts availability, and restricts finalization to the leader', async () => {
    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        name: 'Reunion Trip',
        destination: 'Nha Trang',
        startDate: '2026-03-18',
        endDate: '2026-03-20',
      })
      .expect(201);

    const reunionTripId = tripRes.body.id;

    await request(app.getHttpServer())
      .post(`/trips/${tripRes.body.joinCode}/join`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(201);

    const reunion = await request(app.getHttpServer())
      .get(`/trips/${reunionTripId}/memories/reunion`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .expect(200);

    expect(reunion.body.eligible).toBe(true);
    expect(reunion.body.recommendedDate).toBeTruthy();

    const availability = await request(app.getHttpServer())
      .post(`/trips/${reunionTripId}/memories/reunion/availability`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        selectedDates: [reunion.body.suggestedDateOptions[0]],
        note: 'Rảnh tối thứ bảy',
      })
      .expect(201);

    expect(availability.body.availability).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selectedDates: [reunion.body.suggestedDateOptions[0]],
        }),
      ]),
    );

    await request(app.getHttpServer())
      .post(`/trips/${reunionTripId}/memories/reunion/finalize`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ finalizedDate: reunion.body.suggestedDateOptions[0] })
      .expect(403);

    const finalized = await request(app.getHttpServer())
      .post(`/trips/${reunionTripId}/memories/reunion/finalize`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({ finalizedDate: reunion.body.suggestedDateOptions[0] })
      .expect(201);

    expect(finalized.body.finalizedDate).toBe(reunion.body.suggestedDateOptions[0]);
  });
});

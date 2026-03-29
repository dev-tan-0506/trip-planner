"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Phase 03 Attendance API', () => {
    let app;
    let leaderToken;
    let memberToken;
    let tripId;
    let sessionId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('registers leader and member then creates trip', async () => {
        const leader = await request(app.getHttpServer()).post('/auth/register').send({
            email: 'leader-attendance-e2e@test.com',
            password: 'Test12345!',
            name: 'Leader Attendance',
        });
        leaderToken =
            leader.status === 201
                ? leader.body.accessToken
                : (await request(app.getHttpServer()).post('/auth/login').send({
                    email: 'leader-attendance-e2e@test.com',
                    password: 'Test12345!',
                })).body.accessToken;
        const member = await request(app.getHttpServer()).post('/auth/register').send({
            email: 'member-attendance-e2e@test.com',
            password: 'Test12345!',
            name: 'Member Attendance',
        });
        memberToken =
            member.status === 201
                ? member.body.accessToken
                : (await request(app.getHttpServer()).post('/auth/login').send({
                    email: 'member-attendance-e2e@test.com',
                    password: 'Test12345!',
                })).body.accessToken;
        const trip = await request(app.getHttpServer())
            .post('/trips')
            .set('Authorization', `Bearer ${leaderToken}`)
            .send({
            name: 'Attendance E2E Trip',
            destination: 'Hue',
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
    it('leader opens session and member submits proof', async () => {
        const openSession = await request(app.getHttpServer())
            .post(`/trips/${tripId}/attendance/sessions`)
            .set('Authorization', `Bearer ${leaderToken}`)
            .send({
            title: 'Điểm tập trung',
            meetingLabel: 'Cổng chính',
            meetingAddress: '1 Le Loi',
            opensAt: new Date().toISOString(),
            closesAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        })
            .expect(201);
        sessionId = openSession.body.session.id;
        const submit = await request(app.getHttpServer())
            .post(`/attendance/sessions/${sessionId}/submissions`)
            .set('Authorization', `Bearer ${memberToken}`)
            .send({
            imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9pM1i3QAAAAASUVORK5CYII=',
            locationStatus: 'UNAVAILABLE',
        })
            .expect(201);
        expect(submit.body.session.id).toBe(sessionId);
        expect(Array.isArray(submit.body.members)).toBe(true);
    });
});
//# sourceMappingURL=phase-03-attendance.e2e-spec.js.map
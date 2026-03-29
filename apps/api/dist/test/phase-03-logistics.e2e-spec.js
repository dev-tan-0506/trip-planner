"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
describe('Phase 03 Logistics API', () => {
    let app;
    let prisma;
    let leaderToken;
    let memberToken;
    let tripId;
    let joinCode;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        prisma = app.get(prisma_service_1.PrismaService);
    });
    afterAll(async () => {
        await app.close();
    });
    describe('Setup: Create users and trip', () => {
        it('should register a leader user', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send({
                email: 'leader-logistics-e2e@test.com',
                password: 'Test12345!',
                name: 'Leader Logistics',
            });
            if (res.status === 201) {
                leaderToken = res.body.accessToken;
            }
            else {
                const loginRes = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                    email: 'leader-logistics-e2e@test.com',
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
                email: 'member-logistics-e2e@test.com',
                password: 'Test12345!',
                name: 'Member Logistics',
            });
            if (res.status === 201) {
                memberToken = res.body.accessToken;
            }
            else {
                const loginRes = await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                    email: 'member-logistics-e2e@test.com',
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
                name: 'Logistics E2E Trip',
                destination: 'Da Nang',
                startDate: '2026-06-01',
                endDate: '2026-06-05',
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
    describe('Leader creates logistics units', () => {
        it('POST /trips/:tripId/logistics/units — creates a room', async () => {
            const res = await request(app.getHttpServer())
                .post(`/trips/${tripId}/logistics/units`)
                .set('Authorization', `Bearer ${leaderToken}`)
                .send({ type: 'ROOM', label: 'Phòng 101', capacity: 4 })
                .expect(201);
            expect(res.body.roomUnits).toHaveLength(1);
            expect(res.body.roomUnits[0].label).toBe('Phòng 101');
            expect(res.body.roomUnits[0].capacity).toBe(4);
        });
        it('POST /trips/:tripId/logistics/units — creates a ride', async () => {
            const res = await request(app.getHttpServer())
                .post(`/trips/${tripId}/logistics/units`)
                .set('Authorization', `Bearer ${leaderToken}`)
                .send({ type: 'RIDE', label: 'Xe 7 chỗ A', capacity: 7 })
                .expect(201);
            expect(res.body.rideUnits).toHaveLength(1);
            expect(res.body.rideUnits[0].label).toBe('Xe 7 chỗ A');
        });
        it('member cannot create units', async () => {
            await request(app.getHttpServer())
                .post(`/trips/${tripId}/logistics/units`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ type: 'ROOM', label: 'Phòng Hack', capacity: 2 })
                .expect(403);
        });
    });
    describe('Member self-join and leave', () => {
        let roomUnitId;
        it('GET /trips/:tripId/logistics/allocations — returns snapshot', async () => {
            const res = await request(app.getHttpServer())
                .get(`/trips/${tripId}/logistics/allocations`)
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);
            expect(res.body.isLeader).toBe(false);
            expect(res.body.roomUnits).toHaveLength(1);
            roomUnitId = res.body.roomUnits[0].id;
        });
        it('POST .../assignments/self-join — member joins a room', async () => {
            const res = await request(app.getHttpServer())
                .post(`/trips/${tripId}/logistics/assignments/self-join`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ unitId: roomUnitId })
                .expect(201);
            const room = res.body.roomUnits[0];
            expect(room.occupancy).toBe(1);
            expect(room.members).toHaveLength(1);
            expect(room.members[0].source).toBe('SELF_JOIN');
        });
        it('POST .../assignments/self-join — rejects duplicate same-type assignment', async () => {
            await request(app.getHttpServer())
                .post(`/trips/${tripId}/logistics/assignments/self-join`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ unitId: roomUnitId })
                .expect(400);
        });
        it('POST .../assignments/leave — member leaves the room', async () => {
            const res = await request(app.getHttpServer())
                .post(`/trips/${tripId}/logistics/assignments/leave`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ type: 'ROOM' })
                .expect(201);
            const room = res.body.roomUnits[0];
            expect(room.occupancy).toBe(0);
            expect(room.members).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=phase-03-logistics.e2e-spec.js.map
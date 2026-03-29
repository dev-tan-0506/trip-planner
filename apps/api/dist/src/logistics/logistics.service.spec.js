"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const logistics_service_1 = require("./logistics.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
describe('LogisticsService', () => {
    let service;
    let prisma;
    const mockPrisma = {
        tripMember: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        logisticsUnit: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        allocationAssignment: {
            findFirst: jest.fn(),
            create: jest.fn(),
            createMany: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
            findMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                logistics_service_1.LogisticsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get(logistics_service_1.LogisticsService);
        prisma = mockPrisma;
        jest.clearAllMocks();
    });
    const leaderMember = { id: 'tm-leader', userId: 'user-leader', tripId: 'trip-1', role: 'LEADER' };
    const regularMember = { id: 'tm-member', userId: 'user-member', tripId: 'trip-1', role: 'MEMBER' };
    describe('capacity checks', () => {
        it('should prevent self-join when unit is at capacity', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(regularMember);
            prisma.logisticsUnit.findFirst.mockResolvedValue({
                id: 'unit-1', tripId: 'trip-1', type: 'ROOM', capacity: 2,
                assignments: [{ id: 'a1' }, { id: 'a2' }],
            });
            prisma.allocationAssignment.findFirst.mockResolvedValue(null);
            prisma.$transaction.mockImplementation(async (fn) => {
                const txPrisma = {
                    logisticsUnit: {
                        findUnique: jest.fn().mockResolvedValue({
                            id: 'unit-1', type: 'ROOM', capacity: 2,
                            assignments: [{ id: 'a1' }, { id: 'a2' }],
                        }),
                    },
                    allocationAssignment: { create: jest.fn() },
                };
                return fn(txPrisma);
            });
            await expect(service.selfJoin('trip-1', 'user-member', { unitId: 'unit-1' })).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('duplicate-assignment prevention', () => {
        it('should reject self-join when member already has an assignment of same type', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(regularMember);
            prisma.logisticsUnit.findFirst.mockResolvedValue({
                id: 'unit-2', tripId: 'trip-1', type: 'ROOM', capacity: 4,
                assignments: [],
            });
            prisma.allocationAssignment.findFirst.mockResolvedValue({
                id: 'existing', unitId: 'unit-1', tripMemberId: 'tm-member',
            });
            await expect(service.selfJoin('trip-1', 'user-member', { unitId: 'unit-2' })).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('self-join', () => {
        it('should allow self-join for open slot', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(regularMember);
            prisma.logisticsUnit.findFirst.mockResolvedValue({
                id: 'unit-1', tripId: 'trip-1', type: 'ROOM', capacity: 4,
                assignments: [],
            });
            prisma.allocationAssignment.findFirst.mockResolvedValue(null);
            prisma.$transaction.mockImplementation(async (fn) => {
                const txPrisma = {
                    logisticsUnit: {
                        findUnique: jest.fn().mockResolvedValue({
                            id: 'unit-1', type: 'ROOM', capacity: 4,
                            assignments: [],
                        }),
                    },
                    allocationAssignment: { create: jest.fn().mockResolvedValue({}) },
                };
                return fn(txPrisma);
            });
            prisma.logisticsUnit.findMany.mockResolvedValue([]);
            prisma.tripMember.findMany.mockResolvedValue([]);
            const result = await service.selfJoin('trip-1', 'user-member', { unitId: 'unit-1' });
            expect(result).toBeDefined();
        });
    });
    describe('self-leave', () => {
        it('should allow member to leave their own assignment', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(regularMember);
            prisma.allocationAssignment.findFirst.mockResolvedValue({
                id: 'assign-1', tripMemberId: 'tm-member',
            });
            prisma.allocationAssignment.delete.mockResolvedValue({});
            prisma.logisticsUnit.findMany.mockResolvedValue([]);
            prisma.tripMember.findMany.mockResolvedValue([]);
            const result = await service.leave('trip-1', 'user-member', { type: 'ROOM' });
            expect(result).toBeDefined();
            expect(prisma.allocationAssignment.delete).toHaveBeenCalledWith({
                where: { id: 'assign-1' },
            });
        });
        it('should throw when member has no assignment to leave', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(regularMember);
            prisma.allocationAssignment.findFirst.mockResolvedValue(null);
            await expect(service.leave('trip-1', 'user-member', { type: 'ROOM' })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('leader override', () => {
        it('should allow leader to reassign member', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(leaderMember);
            prisma.logisticsUnit.findFirst.mockResolvedValue({
                id: 'unit-2', tripId: 'trip-1', type: 'ROOM',
            });
            prisma.tripMember.findFirst = jest.fn().mockResolvedValue(regularMember);
            prisma.allocationAssignment.deleteMany.mockResolvedValue({});
            prisma.allocationAssignment.create.mockResolvedValue({});
            prisma.logisticsUnit.findMany.mockResolvedValue([]);
            prisma.tripMember.findMany.mockResolvedValue([]);
            const result = await service.reassign('trip-1', 'user-leader', {
                tripMemberId: 'tm-member',
                targetUnitId: 'unit-2',
            });
            expect(result).toBeDefined();
        });
        it('should reject non-leader reassign', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(regularMember);
            await expect(service.reassign('trip-1', 'user-member', {
                tripMemberId: 'tm-another',
                targetUnitId: 'unit-1',
            })).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    describe('overbooked-capacity warnings', () => {
        it('should report overbooked when capacity lower than occupancy', async () => {
            prisma.tripMember.findUnique.mockResolvedValue(leaderMember);
            prisma.logisticsUnit.findMany.mockResolvedValue([
                {
                    id: 'unit-1',
                    tripId: 'trip-1',
                    type: 'ROOM',
                    label: 'Phòng 1',
                    capacity: 2,
                    sortOrder: 1,
                    note: null,
                    assignments: [
                        { id: 'a1', tripMemberId: 'tm-1', source: 'LEADER', member: { id: 'tm-1', userId: 'u1', role: 'MEMBER', user: { id: 'u1', name: 'A', avatarUrl: null } } },
                        { id: 'a2', tripMemberId: 'tm-2', source: 'LEADER', member: { id: 'tm-2', userId: 'u2', role: 'MEMBER', user: { id: 'u2', name: 'B', avatarUrl: null } } },
                        { id: 'a3', tripMemberId: 'tm-3', source: 'LEADER', member: { id: 'tm-3', userId: 'u3', role: 'MEMBER', user: { id: 'u3', name: 'C', avatarUrl: null } } },
                    ],
                },
            ]);
            prisma.tripMember.findMany.mockResolvedValue([]);
            const result = await service.getAllocationSnapshot('trip-1', 'user-leader');
            expect(result.roomUnits[0].isOverbooked).toBe(true);
            expect(result.roomUnits[0].overCapacityBy).toBe(1);
            expect(result.roomUnits[0].remainingCapacity).toBe(0);
        });
    });
});
//# sourceMappingURL=logistics.service.spec.js.map
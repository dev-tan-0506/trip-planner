"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const itinerary_service_1 = require("./itinerary.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_1 = require("@nestjs/common");
describe('ItineraryService', () => {
    let service;
    let prisma;
    const leaderUserId = 'leader-user-id';
    const memberUserId = 'member-user-id';
    const tripId = 'trip-id';
    const mockTrip = {
        id: tripId,
        name: 'Da Nang Trip',
        destination: 'Da Nang',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-05'),
        joinCode: 'ABC123',
        timeZone: 'Asia/Ho_Chi_Minh',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockLeaderMember = {
        id: 'member-1',
        userId: leaderUserId,
        tripId,
        role: 'LEADER',
        joinedAt: new Date(),
    };
    const mockRegularMember = {
        id: 'member-2',
        userId: memberUserId,
        tripId,
        role: 'MEMBER',
        joinedAt: new Date(),
    };
    const mockPrismaService = {
        tripMember: {
            findUnique: jest.fn(),
        },
        trip: {
            findUnique: jest.fn(),
        },
        itineraryItem: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                itinerary_service_1.ItineraryService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(itinerary_service_1.ItineraryService);
        prisma = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getTripItinerarySnapshot', () => {
        it('should return grouped days with items ordered by sortOrder', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
            mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
            mockPrismaService.itineraryItem.findMany.mockResolvedValue([
                {
                    id: 'item-1',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 1,
                    startMinute: 480,
                    title: 'Breakfast',
                    locationName: 'Cafe 1',
                    locationAddress: null,
                    placeId: null,
                    lat: 16.054,
                    lng: 108.221,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
                {
                    id: 'item-2',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 2,
                    startMinute: 600,
                    title: 'Visit Museum',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: null,
                    lng: null,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 2 },
                },
                {
                    id: 'item-3',
                    tripId,
                    dayIndex: 1,
                    sortOrder: 1,
                    startMinute: null,
                    title: 'Beach Day',
                    locationName: 'My Khe Beach',
                    locationAddress: null,
                    placeId: null,
                    lat: 16.039,
                    lng: 108.247,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
            ]);
            const snapshot = await service.getTripItinerarySnapshot(tripId, leaderUserId);
            expect(snapshot.days).toHaveLength(2);
            expect(snapshot.days[0].dayIndex).toBe(0);
            expect(snapshot.days[0].items).toHaveLength(2);
            expect(snapshot.days[0].items[0].sortOrder).toBe(1);
            expect(snapshot.days[0].items[1].sortOrder).toBe(2);
            expect(snapshot.days[1].dayIndex).toBe(1);
            expect(snapshot.days[1].items).toHaveLength(1);
            expect(snapshot.totalItems).toBe(3);
            expect(snapshot.isLeader).toBe(true);
            expect(snapshot.canEdit).toBe(true);
        });
        it('should include proposal counts per item', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
            mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
            mockPrismaService.itineraryItem.findMany.mockResolvedValue([
                {
                    id: 'item-1',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 1,
                    startMinute: 480,
                    title: 'Breakfast',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: null,
                    lng: null,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 3 },
                },
            ]);
            const snapshot = await service.getTripItinerarySnapshot(tripId, leaderUserId);
            expect(snapshot.days[0].items[0].proposalCount).toBe(3);
        });
        it('should return mapItems only for items with lat/lng', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
            mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
            mockPrismaService.itineraryItem.findMany.mockResolvedValue([
                {
                    id: 'item-1',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 1,
                    startMinute: 480,
                    title: 'Cafe',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: 16.054,
                    lng: 108.221,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
                {
                    id: 'item-2',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 2,
                    startMinute: 600,
                    title: 'Museum',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: null,
                    lng: null,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
            ]);
            const snapshot = await service.getTripItinerarySnapshot(tripId, leaderUserId);
            expect(snapshot.mapItems).toHaveLength(1);
            expect(snapshot.mapItems[0].id).toBe('item-1');
        });
        it('should compute untimed item state as "chua chot gio"', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
            mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
            mockPrismaService.itineraryItem.findMany.mockResolvedValue([
                {
                    id: 'item-1',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 1,
                    startMinute: null,
                    title: 'Free Time',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: null,
                    lng: null,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
            ]);
            const snapshot = await service.getTripItinerarySnapshot(tripId, leaderUserId);
            expect(snapshot.days[0].items[0].progress).toBe('chua chot gio');
            expect(snapshot.days[0].items[0].startTime).toBeNull();
        });
        it('should detect overlap warnings for items within 30 minutes on the same day', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
            mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
            mockPrismaService.itineraryItem.findMany.mockResolvedValue([
                {
                    id: 'item-1',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 1,
                    startMinute: 480,
                    title: 'Breakfast',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: null,
                    lng: null,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
                {
                    id: 'item-2',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 2,
                    startMinute: 490,
                    title: 'Coffee',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: null,
                    lng: null,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
            ]);
            const snapshot = await service.getTripItinerarySnapshot(tripId, leaderUserId);
            expect(snapshot.overlapWarnings).toHaveLength(1);
            expect(snapshot.overlapWarnings[0].itemId).toBe('item-2');
            expect(snapshot.overlapWarnings[0].conflictsWith).toBe('item-1');
        });
    });
    describe('leader-only structural mutations', () => {
        it('should throw ForbiddenException when a member tries to create an item', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockRegularMember);
            await expect(service.createItem(tripId, memberUserId, {
                title: 'New Item',
                dayIndex: 0,
            })).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should throw ForbiddenException when a member tries to delete an item', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockRegularMember);
            await expect(service.deleteItem(tripId, memberUserId, 'item-1')).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should throw ForbiddenException when a non-member tries to access', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(null);
            await expect(service.createItem(tripId, 'unknown-user', {
                title: 'Test',
                dayIndex: 0,
            })).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    describe('move-between-days reorder normalization', () => {
        it('should normalize sortOrder to 1..N per day during reorder', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
            mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
            mockPrismaService.itineraryItem.findMany.mockResolvedValue([]);
            const txMock = {
                itineraryItem: {
                    update: jest.fn().mockResolvedValue({}),
                },
            };
            mockPrismaService.$transaction.mockImplementation(async (fn) => fn(txMock));
            await service.reorderItems(tripId, leaderUserId, {
                items: [
                    { itemId: 'item-a', dayIndex: 0, sortOrder: 5 },
                    { itemId: 'item-b', dayIndex: 0, sortOrder: 10 },
                    { itemId: 'item-c', dayIndex: 1, sortOrder: 3 },
                ],
            });
            expect(txMock.itineraryItem.update).toHaveBeenCalledTimes(6);
            const calls = txMock.itineraryItem.update.mock.calls;
            expect(calls[2][0]).toEqual({
                where: { id: 'item-a' },
                data: { dayIndex: 0, sortOrder: 1 },
            });
            expect(calls[3][0]).toEqual({
                where: { id: 'item-b' },
                data: { dayIndex: 0, sortOrder: 2 },
            });
            expect(calls[5][0]).toEqual({
                where: { id: 'item-c' },
                data: { dayIndex: 1, sortOrder: 1 },
            });
        });
    });
    describe('startTime conversion', () => {
        it('should expose startTime as HH:mm and persist as startMinute', async () => {
            mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
            mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
            mockPrismaService.itineraryItem.findMany.mockResolvedValue([
                {
                    id: 'item-1',
                    tripId,
                    dayIndex: 0,
                    sortOrder: 1,
                    startMinute: 510,
                    title: 'Breakfast',
                    locationName: null,
                    locationAddress: null,
                    placeId: null,
                    lat: null,
                    lng: null,
                    shortNote: null,
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { proposals: 0 },
                },
            ]);
            const snapshot = await service.getTripItinerarySnapshot(tripId, leaderUserId);
            expect(snapshot.days[0].items[0].startTime).toBe('08:30');
            expect(snapshot.days[0].items[0].startMinute).toBe(510);
        });
    });
});
//# sourceMappingURL=itinerary.service.spec.js.map
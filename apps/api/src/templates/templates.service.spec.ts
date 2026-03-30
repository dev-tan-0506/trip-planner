import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prisma: Record<string, any>;

  const mockPrisma = {
    tripMember: { findUnique: jest.fn() },
    trip: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    communityTemplate: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    itineraryItem: {
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    prisma = mockPrisma;
  });

  describe('publishTemplate', () => {
    it('should reject non-leader publish attempts', async () => {
      prisma.tripMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        service.publishTemplate('trip-1', 'user-2', { title: 'My Template' }),
      ).rejects.toThrow('Only the trip leader');
    });

    it('should create sanitizedSnapshot without member data, joinCode, votes, or proposals', async () => {
      prisma.tripMember.findUnique.mockResolvedValue({ role: 'LEADER' });
      prisma.communityTemplate.findFirst.mockResolvedValue(null);
      prisma.trip.findUnique.mockResolvedValue({
        id: 'trip-1',
        destination: 'Da Lat',
        joinCode: 'SECRET123',
        itineraryItems: [
          {
            dayIndex: 0,
            sortOrder: 1,
            title: 'Visit Market',
            startMinute: 480,
            locationName: 'Dalat Market',
            lat: 11.94,
            lng: 108.44,
            shortNote: 'Great coffee',
          },
          {
            dayIndex: 0,
            sortOrder: 2,
            title: 'Lunch',
            startMinute: 720,
            locationName: 'Pho Place',
            lat: null,
            lng: null,
            shortNote: null,
          },
          {
            dayIndex: 1,
            sortOrder: 1,
            title: 'Hike',
            startMinute: 360,
            locationName: 'Mount Lang Biang',
            lat: 12.04,
            lng: 108.44,
            shortNote: 'Bring water',
          },
        ],
      });
      prisma.communityTemplate.create.mockImplementation(({ data }: any) => ({
        id: 'template-1',
        ...data,
      }));

      const result = await service.publishTemplate('trip-1', 'leader-1', {
        title: 'Da Lat Template',
        summary: 'A great trip',
      });

      // Verify sanitizedSnapshot structure
      const snapshot = result.sanitizedSnapshot as any;
      expect(snapshot.destination).toBe('Da Lat');
      expect(snapshot.days).toHaveLength(2);

      // Day 0 has 2 items, Day 1 has 1 item
      expect(snapshot.days[0].items).toHaveLength(2);
      expect(snapshot.days[1].items).toHaveLength(1);

      // Items contain only planning data
      expect(snapshot.days[0].items[0].title).toBe('Visit Market');
      expect(snapshot.days[0].items[0].locationName).toBe('Dalat Market');
      expect(snapshot.days[0].items[0].startMinute).toBe(480);

      // Verify no personal/sensitive data leaked
      const snapshotStr = JSON.stringify(snapshot);
      expect(snapshotStr).not.toContain('SECRET123'); // no joinCode
      expect(snapshotStr).not.toContain('userId'); // no user references
      expect(snapshotStr).not.toContain('vote'); // no vote data
      expect(snapshotStr).not.toContain('proposal'); // no proposal data
      expect(snapshotStr).not.toContain('member'); // no member data

      // Verify daysCount
      expect(result.daysCount).toBe(2);
    });
  });

  describe('cloneTemplate', () => {
    const templateFixture = {
      id: 'template-1',
      sourceTripId: 'source-trip',
      sanitizedSnapshot: {
        destination: 'Da Lat',
        days: [
          {
            dayIndex: 0,
            items: [
              { title: 'Market', startMinute: 480, locationName: 'Market', lat: 11.94, lng: 108.44, shortNote: null, sortOrder: 1 },
            ],
          },
          {
            dayIndex: 1,
            items: [
              { title: 'Hike', startMinute: 360, locationName: 'Mountain', lat: 12.04, lng: 108.44, shortNote: 'Bring water', sortOrder: 1 },
              { title: 'Dinner', startMinute: 1080, locationName: 'Restaurant', lat: null, lng: null, shortNote: null, sortOrder: 2 },
            ],
          },
        ],
      },
    };

    it('should create a new trip with caller as LEADER', async () => {
      prisma.communityTemplate.findUnique.mockResolvedValue(templateFixture);
      prisma.trip.create.mockResolvedValue({
        id: 'new-trip-1',
        joinCode: 'NEWCODE1',
      });
      prisma.itineraryItem.createMany.mockResolvedValue({ count: 3 });
      prisma.communityTemplate.update.mockResolvedValue({});

      const result = await service.cloneTemplate('template-1', 'user-1', {
        name: 'My Da Lat Trip',
        destination: 'Da Lat',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        timeZone: 'Asia/Ho_Chi_Minh',
      });

      // joinCode is randomly generated by the service, just verify it's returned
      expect(result.joinCode).toBeDefined();
      expect(typeof result.joinCode).toBe('string');

      // Verify trip created with LEADER membership
      expect(prisma.trip.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'My Da Lat Trip',
            destination: 'Da Lat',
            members: {
              create: { userId: 'user-1', role: 'LEADER' },
            },
          }),
        }),
      );
    });

    it('should deep-copy itinerary items with no FK back to source trip', async () => {
      prisma.communityTemplate.findUnique.mockResolvedValue(templateFixture);
      prisma.trip.create.mockResolvedValue({
        id: 'new-trip-2',
        joinCode: 'NEWCODE2',
      });
      prisma.itineraryItem.createMany.mockResolvedValue({ count: 3 });
      prisma.communityTemplate.update.mockResolvedValue({});

      await service.cloneTemplate('template-1', 'user-1', {
        name: 'Clone Trip',
        destination: 'Da Lat',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        timeZone: 'Asia/Ho_Chi_Minh',
      });

      // Verify createMany was called with remapped items
      const createManyCall = prisma.itineraryItem.createMany.mock.calls[0][0];
      const items = createManyCall.data;

      expect(items).toHaveLength(3);
      // All items reference the new trip, not the source
      expect(items.every((i: any) => i.tripId === 'new-trip-2')).toBe(true);
      // No sourceTripId field
      expect(items.every((i: any) => !i.sourceTripId)).toBe(true);
      // Items preserve relative day indexes
      expect(items[0].dayIndex).toBe(0);
      expect(items[1].dayIndex).toBe(1);
      expect(items[2].dayIndex).toBe(1);
    });

    it('should increment cloneCount on successful clone', async () => {
      prisma.communityTemplate.findUnique.mockResolvedValue(templateFixture);
      prisma.trip.create.mockResolvedValue({
        id: 'new-trip-3',
        joinCode: 'NEWCODE3',
      });
      prisma.itineraryItem.createMany.mockResolvedValue({ count: 3 });
      prisma.communityTemplate.update.mockResolvedValue({});

      await service.cloneTemplate('template-1', 'user-1', {
        name: 'Clone Trip',
        destination: 'Da Lat',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        timeZone: 'Asia/Ho_Chi_Minh',
      });

      expect(prisma.communityTemplate.update).toHaveBeenCalledWith({
        where: { id: 'template-1' },
        data: { cloneCount: { increment: 1 } },
      });
    });
  });
});

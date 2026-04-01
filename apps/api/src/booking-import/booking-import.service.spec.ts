import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { BookingImportDraftStatus } from '@prisma/client';
import { ItineraryService } from '../itinerary/itinerary.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingImportService } from './booking-import.service';

describe('BookingImportService', () => {
  let service: BookingImportService;

  const tripId = 'trip-1';
  const leaderUserId = 'leader-user-1';
  const memberUserId = 'member-user-1';
  const leaderMembership = {
    id: 'member-leader-1',
    userId: leaderUserId,
    tripId,
    role: 'LEADER',
    trip: {
      id: tripId,
      joinCode: 'joinabc',
    },
  };
  const memberMembership = {
    id: 'member-regular-1',
    userId: memberUserId,
    tripId,
    role: 'MEMBER',
    trip: {
      id: tripId,
      joinCode: 'joinabc',
    },
  };

  const mockPrismaService = {
    tripMember: {
      findUnique: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
    bookingImportDraft: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockItineraryService = {
    createItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingImportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ItineraryService,
          useValue: mockItineraryService,
        },
      ],
    }).compile();

    service = module.get<BookingImportService>(BookingImportService);
    jest.clearAllMocks();
  });

  it('returns a forwarding address based on the trip join code', async () => {
    mockPrismaService.tripMember.findUnique.mockResolvedValue(leaderMembership);

    const config = await service.getImportConfig(tripId, leaderUserId);

    expect(config.forwardingAddress).toBe('booking+joinabc@minhdidauthe.local');
    expect(config.manualPasteEnabled).toBe(true);
  });

  it('creates a low-confidence manual draft and preserves raw excerpt text', async () => {
    mockPrismaService.tripMember.findUnique.mockResolvedValue(leaderMembership);
    mockPrismaService.bookingImportDraft.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'draft-1',
      ...data,
      status: BookingImportDraftStatus.DRAFT,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-01T10:00:00Z'),
    }));

    const draft = await service.createDraftFromRawContent(tripId, leaderUserId, {
      rawContent: 'Flight VN123 du kien 08:30. Cho xac nhan cua hang.',
      sourceSubject: 'Ve may bay',
    });

    expect(draft.forwardingAddress).toBe('booking+joinabc@minhdidauthe.local');
    expect(draft.confidenceLabel).toBe('Can xem lai');
    expect(draft.parseSummary).toContain('can xem lai');
    expect((draft.parsedItems as Array<{ rawExcerpt: string }>)[0].rawExcerpt).toContain('Flight VN123');
  });

  it('creates an inbound draft from the forwarded address', async () => {
    mockPrismaService.trip.findUnique.mockResolvedValue({
      id: tripId,
      joinCode: 'joinabc',
    });
    mockPrismaService.bookingImportDraft.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'draft-inbound',
      ...data,
      status: BookingImportDraftStatus.DRAFT,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-01T10:00:00Z'),
    }));

    const draft = await service.createDraftFromInbound({
      recipientAddress: 'booking+joinabc@minhdidauthe.local',
      rawContent: 'Khach san tai My Khe 14:00 ABC123',
      sourceSender: 'hotel@test.com',
    });

    expect(draft.sourceChannel).toBe('FORWARDED_EMAIL');
    expect(draft.forwardingAddress).toBe('booking+joinabc@minhdidauthe.local');
  });

  it('does not allow non-leaders to confirm a booking import draft', async () => {
    mockPrismaService.tripMember.findUnique.mockResolvedValue(memberMembership);

    await expect(
      service.confirmBookingImportDraft(tripId, 'draft-1', memberUserId, {}),
    ).rejects.toThrow(ForbiddenException);
  });

  it('confirms a draft only after creating itinerary items', async () => {
    mockPrismaService.tripMember.findUnique.mockResolvedValue(leaderMembership);
    mockPrismaService.bookingImportDraft.findFirst.mockResolvedValue({
      id: 'draft-1',
      tripId,
      createdByTripMemberId: leaderMembership.id,
      reviewedByTripMemberId: null,
      sourceChannel: 'MANUAL_PASTE',
      forwardingAddress: 'booking+joinabc@minhdidauthe.local',
      sourceMessageId: null,
      sourceSender: null,
      sourceSubject: null,
      rawContent: 'Khach san tai My Khe 14:00 ABC123',
      confidenceLabel: 'Goi y',
      status: BookingImportDraftStatus.DRAFT,
      parseSummary: 'summary',
      parsedItems: [
        {
          title: 'Nhan phong',
          locationName: 'My Khe',
          startTime: '14:00',
          endTime: null,
          bookingCode: 'ABC123',
          missingFields: [],
          rawExcerpt: 'Khach san tai My Khe 14:00 ABC123',
        },
      ],
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-01T10:00:00Z'),
    });
    mockItineraryService.createItem.mockResolvedValue({
      tripId,
      days: [],
      overlapWarnings: [],
      healthWarnings: [],
      mapItems: [],
      totalItems: 1,
      isLeader: true,
      canEdit: true,
    });
    mockPrismaService.bookingImportDraft.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'draft-1',
      tripId,
      createdByTripMemberId: leaderMembership.id,
      reviewedByTripMemberId: data.reviewedByTripMemberId,
      sourceChannel: 'MANUAL_PASTE',
      forwardingAddress: 'booking+joinabc@minhdidauthe.local',
      sourceMessageId: null,
      sourceSender: null,
      sourceSubject: null,
      rawContent: 'Khach san tai My Khe 14:00 ABC123',
      confidenceLabel: 'Goi y',
      status: data.status,
      parseSummary: 'summary',
      parsedItems: data.parsedItems,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-01T10:05:00Z'),
    }));

    const result = await service.confirmBookingImportDraft(tripId, 'draft-1', leaderUserId, {});

    expect(mockItineraryService.createItem).toHaveBeenCalledTimes(1);
    expect(mockItineraryService.createItem).toHaveBeenCalledWith(
      tripId,
      leaderUserId,
      expect.objectContaining({
        title: 'Nhan phong',
        dayIndex: 0,
        startTime: '14:00',
        locationName: 'My Khe',
      }),
    );
    expect(result.draft.status).toBe(BookingImportDraftStatus.CONFIRMED);
    expect(result.draft.reviewedByTripMemberId).toBe(leaderMembership.id);
  });

  it('rejects inbound drafts with an invalid forwarding address shape', async () => {
    await expect(
      service.createDraftFromInbound({
        recipientAddress: 'wrong-address@test.local',
        rawContent: 'Noise',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

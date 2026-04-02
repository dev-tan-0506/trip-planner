import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VaultStorageService } from './vault-storage.service';
import { MemoriesService } from './memories.service';
import { ReunionInviteMailerService } from './reunion-invite-mailer.service';

describe('MemoriesService', () => {
  let service: MemoriesService;

  const tripId = 'trip-vault';
  const leaderUserId = 'user-leader';
  const memberUserId = 'user-member';

  const leaderMembership = {
    id: 'member-leader',
    tripId,
    userId: leaderUserId,
    role: 'LEADER',
  };

  const memberMembership = {
    id: 'member-01',
    tripId,
    userId: memberUserId,
    role: 'MEMBER',
  };

  const mockPrisma = {
    tripMember: {
      findUnique: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    vaultDocument: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    tripFeedbackPoll: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    anonymousFeedbackSubmission: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    feedbackSubmissionReceipt: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    reunionInvite: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reunionInviteDelivery: {
      create: jest.fn(),
    },
    reunionAvailability: {
      upsert: jest.fn(),
    },
  };

  const mockVaultStorageService = {
    saveDocument: jest.fn(),
  };

  const mockReunionInviteMailerService = {
    sendInviteEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoriesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: VaultStorageService, useValue: mockVaultStorageService },
        { provide: ReunionInviteMailerService, useValue: mockReunionInviteMailerService },
      ],
    }).compile();

    service = module.get<MemoriesService>(MemoriesService);
    jest.clearAllMocks();
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: tripId,
      endDate: new Date('2026-08-03T00:00:00.000Z'),
    });
    mockPrisma.trip.findMany.mockResolvedValue([]);
    mockPrisma.vaultDocument.findMany.mockResolvedValue([]);
    mockPrisma.vaultDocument.create.mockResolvedValue(undefined);
    mockPrisma.vaultDocument.findFirst.mockResolvedValue({
      id: 'doc-1',
      tripId,
    });
    mockPrisma.vaultDocument.update.mockResolvedValue(undefined);
    mockPrisma.tripFeedbackPoll.findUnique.mockResolvedValue({
      id: 'poll-1',
      tripId,
      status: 'OPEN',
      openedAt: new Date('2026-08-03T01:00:00.000Z'),
      closedAt: null,
    });
    mockPrisma.tripFeedbackPoll.create.mockImplementation(async ({ data }) => ({
      id: 'poll-1',
      ...data,
      closedAt: null,
    }));
    mockPrisma.tripFeedbackPoll.update.mockImplementation(async ({ data }) => ({
      id: 'poll-1',
      tripId,
      status: data.status,
      openedAt: data.openedAt ?? new Date('2026-08-03T01:00:00.000Z'),
      closedAt: data.closedAt ?? null,
    }));
    mockPrisma.anonymousFeedbackSubmission.findMany.mockResolvedValue([]);
    mockPrisma.anonymousFeedbackSubmission.create.mockImplementation(async ({ data }) => ({
      id: 'submission-1',
      createdAt: new Date('2026-08-04T08:00:00.000Z'),
      ...data,
    }));
    mockPrisma.feedbackSubmissionReceipt.findFirst.mockResolvedValue(null);
    mockPrisma.feedbackSubmissionReceipt.create.mockResolvedValue(undefined);
    mockPrisma.reunionInvite.create.mockImplementation(async ({ data }) => ({
      id: 'invite-1',
      createdAt: new Date('2026-08-10T00:00:00.000Z'),
      updatedAt: new Date('2026-08-10T00:00:00.000Z'),
      sentAt: null,
      ...data,
      deliveries: [],
      availabilities: [],
    }));
    mockPrisma.reunionInvite.findUnique.mockResolvedValue({
      id: 'invite-1',
      tripId,
      status: 'SENT',
      title: 'Hẹn reunion',
      message: 'Đã tới lúc hẹn reunion',
      suggestedDateOptions: ['2026-08-17', '2026-08-24'],
      recommendedDate: '2026-08-17',
      finalizedDate: null,
      unlockedAt: new Date('2026-08-10T00:00:00.000Z'),
      sentAt: new Date('2026-08-10T00:00:00.000Z'),
      deliveries: [{ recipientEmail: 'member@test.com', status: 'SENT', sentAt: new Date(), errorMessage: null }],
      availabilities: [],
    });
    mockPrisma.reunionInvite.update.mockImplementation(async ({ data }) => ({
      id: 'invite-1',
      tripId,
      status: data.status ?? 'SENT',
      title: 'Hẹn reunion',
      message: 'Đã tới lúc hẹn reunion',
      suggestedDateOptions: ['2026-08-17', '2026-08-24'],
      recommendedDate: data.recommendedDate ?? '2026-08-17',
      finalizedDate: data.finalizedDate ?? null,
      unlockedAt: new Date('2026-08-10T00:00:00.000Z'),
      sentAt: new Date('2026-08-10T00:00:00.000Z'),
      deliveries: [],
      availabilities: [],
    }));
    mockPrisma.reunionInviteDelivery.create.mockResolvedValue(undefined);
    mockPrisma.reunionAvailability.upsert.mockResolvedValue(undefined);
    mockReunionInviteMailerService.sendInviteEmail.mockResolvedValue({
      status: 'SENT',
      sentAt: new Date('2026-08-10T00:00:00.000Z'),
      errorMessage: null,
    });
    mockVaultStorageService.saveDocument.mockResolvedValue('/memories/vault/trip-vault-member-01-ho-chieu.pdf');
  });

  it('vault document upload: stores a pending review document with 7-day retention after trip end', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue(memberMembership);

    await service.uploadVaultDocument(tripId, memberUserId, {
      documentKind: 'PASSPORT',
      fileName: 'Ho chieu.pdf',
      mimeType: 'application/pdf',
      fileDataUrl: 'data:application/pdf;base64,ZmFrZQ==',
      note: 'Ban scan tam thoi',
    });

    expect(mockVaultStorageService.saveDocument).toHaveBeenCalledWith(
      tripId,
      memberMembership.id,
      'Ho chieu.pdf',
      'application/pdf',
      'data:application/pdf;base64,ZmFrZQ==',
    );
    expect(mockPrisma.vaultDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tripId,
          uploadedByTripMemberId: memberMembership.id,
          kind: 'PASSPORT',
          status: 'PENDING_REVIEW',
          mimeType: 'application/pdf',
        }),
      }),
    );
    const createCall = mockPrisma.vaultDocument.create.mock.calls[0][0];
    expect(createCall.data.expiresAt.toISOString()).toBe('2026-08-10T00:00:00.000Z');
  });

  it('vault snapshot: hides other members documents from non-leader responses', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue(memberMembership);

    await service.getVaultSnapshot(tripId, memberUserId);

    expect(mockPrisma.vaultDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tripId,
          uploadedByTripMemberId: memberMembership.id,
        },
      }),
    );
  });

  it('vault review: allows only the leader to change review status', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValueOnce(memberMembership);

    await expect(
      service.reviewVaultDocument(tripId, memberUserId, 'doc-1', {
        status: 'READY_FOR_CHECK_IN',
      }),
    ).rejects.toThrow(ForbiddenException);

    mockPrisma.tripMember.findUnique.mockResolvedValueOnce(leaderMembership);

    await service.reviewVaultDocument(tripId, leaderUserId, 'doc-1', {
      status: 'READY_FOR_CHECK_IN',
    });

    expect(mockPrisma.vaultDocument.update).toHaveBeenCalledWith({
      where: { id: 'doc-1' },
      data: {
        status: 'READY_FOR_CHECK_IN',
        reviewedByTripMemberId: leaderMembership.id,
      },
    });
  });

  it('anonymous feedback receipt: blocks duplicate submissions after one response', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue(memberMembership);
    mockPrisma.feedbackSubmissionReceipt.findFirst.mockResolvedValue(null);

    await service.submitAnonymousFeedback(tripId, memberUserId, {
      moodScore: 4,
      highlight: 'Bữa tối rất vui',
      wishNextTime: 'Đi sớm hơn một chút',
    });

    mockPrisma.feedbackSubmissionReceipt.findFirst.mockResolvedValueOnce({ id: 'receipt-1' });

    await expect(
      service.submitAnonymousFeedback(tripId, memberUserId, {
        moodScore: 5,
        highlight: 'Quá vui',
        wishNextTime: 'Giữ nhóm nhỏ hơn',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('anonymous feedback leader snapshot: exposes only aggregate responses without receipt identity', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue(leaderMembership);
    mockPrisma.anonymousFeedbackSubmission.findMany.mockResolvedValue([
      {
        id: 'submission-1',
        moodScore: 5,
        highlight: 'Rất vui',
        wishNextTime: 'Ở lại thêm một đêm',
        createdAt: new Date('2026-08-04T08:00:00.000Z'),
      },
    ]);

    const result = await service.getFeedbackSnapshot(tripId, leaderUserId);

    expect(result.responses).toEqual([
      expect.objectContaining({
        id: 'submission-1',
        moodScore: 5,
        highlight: 'Rất vui',
      }),
    ]);
    expect(JSON.stringify(result.responses)).not.toContain('tripMemberId');
    expect(result.submittedCount).toBe(1);
  });

  it('final day souvenir snapshot: returns authentic location suggestions only on the last trip day', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue(memberMembership);
    mockPrisma.trip.findUnique.mockResolvedValue({
      destination: 'Đà Nẵng',
      endDate: new Date(),
    });

    const result = await service.getSouvenirSnapshot(tripId, memberUserId);

    expect(result.eligible).toBe(true);
    expect(result.suggestions[0]).toEqual(
      expect.objectContaining({
        locationName: expect.any(String),
        areaLabel: 'Khu gợi ý 1',
      }),
    );
  });

  it('reunion recommendedDate: derives a preferred date from overlapping availability before finalization', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue(leaderMembership);
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: tripId,
      endDate: new Date('2026-03-20T00:00:00.000Z'),
    });
    mockPrisma.reunionInvite.findUnique.mockResolvedValue({
      id: 'invite-1',
      tripId,
      status: 'SENT',
      title: 'Hẹn reunion',
      message: 'Đã tới lúc hẹn reunion',
      suggestedDateOptions: ['2026-04-10', '2026-04-12'],
      recommendedDate: null,
      finalizedDate: null,
      unlockedAt: new Date('2026-03-27T00:00:00.000Z'),
      sentAt: new Date('2026-03-27T00:00:00.000Z'),
      deliveries: [],
      availabilities: [
        { tripMemberId: 'member-01', selectedDates: ['2026-04-10'], note: null },
        { tripMemberId: 'member-leader', selectedDates: ['2026-04-10', '2026-04-12'], note: null },
      ],
    });

    const snapshot = await service.getReunionSnapshot(tripId, leaderUserId);

    expect(snapshot.eligible).toBe(true);
    expect(snapshot.recommendedDate).toBe('2026-04-10');
  });
});

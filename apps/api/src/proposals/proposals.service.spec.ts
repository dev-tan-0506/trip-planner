import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProposalsService', () => {
  let service: ProposalsService;

  const leaderUserId = 'leader-user-id';
  const memberUserId = 'member-user-id';
  const tripId = 'trip-id';

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
    itineraryItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    itineraryProposal: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProposal', () => {
    it('should allow a member to create a proposal', async () => {
      mockPrismaService.tripMember.findUnique.mockResolvedValue(mockRegularMember);
      mockPrismaService.itineraryItem.findFirst.mockResolvedValue({
        id: 'item-1',
        tripId,
        title: 'Breakfast',
        version: 1,
      });
      mockPrismaService.itineraryProposal.create.mockResolvedValue({
        id: 'proposal-1',
        tripId,
        proposerId: memberUserId,
        targetItemId: 'item-1',
        type: 'UPDATE_TIME',
        payload: { startMinute: 540 },
        baseVersion: 1,
        status: 'PENDING',
        proposer: { id: memberUserId, name: 'Member', avatarUrl: null },
      });

      const result = await service.createProposal(tripId, memberUserId, {
        type: 'UPDATE_TIME' as any,
        targetItemId: 'item-1',
        payload: { startMinute: 540 },
        baseVersion: 1,
      });

      expect(result.status).toBe('PENDING');
      expect(result.type).toBe('UPDATE_TIME');
    });

    it('should require targetItemId and baseVersion for update proposals', async () => {
      mockPrismaService.tripMember.findUnique.mockResolvedValue(mockRegularMember);

      await expect(
        service.createProposal(tripId, memberUserId, {
          type: 'UPDATE_TIME' as any,
          payload: { startMinute: 540 },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptProposal', () => {
    it('should allow leader to accept a pending proposal', async () => {
      mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
      mockPrismaService.itineraryProposal.findFirst.mockResolvedValue({
        id: 'proposal-1',
        tripId,
        proposerId: memberUserId,
        targetItemId: 'item-1',
        type: 'UPDATE_TIME',
        payload: { startMinute: 540 },
        baseVersion: 1,
        status: 'PENDING',
      });
      mockPrismaService.itineraryItem.update.mockResolvedValue({
        id: 'item-1',
        version: 2,
      });
      mockPrismaService.itineraryProposal.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.itineraryProposal.update.mockResolvedValue({
        id: 'proposal-1',
        status: 'ACCEPTED',
        reviewedById: leaderUserId,
        proposer: { id: memberUserId, name: 'Member', avatarUrl: null },
        reviewer: { id: leaderUserId, name: 'Leader', avatarUrl: null },
      });

      const result = await service.acceptProposal(tripId, leaderUserId, 'proposal-1');
      expect(result.status).toBe('ACCEPTED');
    });

    it('should reject a member trying to accept a proposal', async () => {
      mockPrismaService.tripMember.findUnique.mockResolvedValue(mockRegularMember);

      await expect(
        service.acceptProposal(tripId, memberUserId, 'proposal-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('rejectProposal', () => {
    it('should allow leader to reject a pending proposal', async () => {
      mockPrismaService.tripMember.findUnique.mockResolvedValue(mockLeaderMember);
      mockPrismaService.itineraryProposal.findFirst.mockResolvedValue({
        id: 'proposal-1',
        tripId,
        status: 'PENDING',
      });
      mockPrismaService.itineraryProposal.update.mockResolvedValue({
        id: 'proposal-1',
        status: 'REJECTED',
        reviewedById: leaderUserId,
        proposer: { id: memberUserId, name: 'Member', avatarUrl: null },
        reviewer: { id: leaderUserId, name: 'Leader', avatarUrl: null },
      });

      const result = await service.rejectProposal(tripId, leaderUserId, 'proposal-1');
      expect(result.status).toBe('REJECTED');
    });
  });

  describe('markOutdatedProposals', () => {
    it('should mark stale proposals as OUTDATED when target item version changes', async () => {
      mockPrismaService.itineraryProposal.updateMany.mockResolvedValue({ count: 2 });

      const count = await service.markOutdatedProposals('item-1', 3);
      expect(count).toBe(2);

      expect(mockPrismaService.itineraryProposal.updateMany).toHaveBeenCalledWith({
        where: {
          targetItemId: 'item-1',
          status: 'PENDING',
          NOT: {
            baseVersion: 3,
          },
        },
        data: {
          status: 'OUTDATED',
        },
      });
    });
  });
});

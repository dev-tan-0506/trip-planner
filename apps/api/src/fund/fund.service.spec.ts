import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FundService } from './fund.service';
import { LocalCostBenchmarkProvider } from './provider/local-cost-benchmark.provider';

describe('FundService', () => {
  let service: FundService;

  const mockPrisma = {
    tripMember: {
      findUnique: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
    tripFund: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    fundContribution: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    fundExpense: {
      create: jest.fn(),
    },
  };

  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundService,
        LocalCostBenchmarkProvider,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(FundService);
    prisma = mockPrisma;
    jest.clearAllMocks();
  });

  it('serializes decimal money values to string in snapshot', async () => {
    prisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-leader',
      role: 'LEADER',
      user: { id: 'u1', name: 'Leader', avatarUrl: null },
    });
    prisma.trip.findUnique.mockResolvedValue({
      destination: 'Da Nang',
    });
    prisma.tripFund.findUnique.mockResolvedValue({
      id: 'fund-1',
      tripId: 'trip-1',
      ownerTripMemberId: 'tm-leader',
      targetAmount: new Prisma.Decimal('1000.50'),
      currency: 'VND',
      momoQrPayload: null,
      bankQrPayload: null,
      status: 'ACTIVE',
      contributions: [
        {
          id: 'c1',
          tripMemberId: 'tm-member',
          declaredAmount: new Prisma.Decimal('300.25'),
          method: 'MOMO',
          status: 'CONFIRMED',
          transferNote: null,
          confirmedAt: new Date('2026-01-01T00:00:00.000Z'),
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          member: {
            id: 'tm-member',
            role: 'MEMBER',
            user: { id: 'u2', name: 'Member', avatarUrl: null },
          },
          confirmedBy: null,
        },
      ],
      expenses: [
        {
          id: 'e1',
          title: 'Xe',
          amount: new Prisma.Decimal('100.00'),
          category: 'TRANSPORT',
          incurredAt: new Date('2026-01-02T00:00:00.000Z'),
          linkedItineraryItemId: null,
          createdBy: {
            id: 'tm-leader',
            user: { id: 'u1', name: 'Leader' },
          },
        },
      ],
    });

    const snapshot = await service.getFundSnapshot('trip-1', 'u1');
    expect(snapshot.summary.targetAmount).toBe('1000.5');
    expect(typeof snapshot.summary.collectedAmount).toBe('string');
    expect(typeof snapshot.summary.spentAmount).toBe('string');
  });

  it('rejects member fund creation', async () => {
    prisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-member',
      role: 'MEMBER',
      user: { id: 'u2', name: 'Member', avatarUrl: null },
    });

    await expect(
      service.createFund('trip-1', 'u2', { targetAmount: '1000' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when confirming missing contribution', async () => {
    prisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-leader',
      role: 'LEADER',
      user: { id: 'u1', name: 'Leader', avatarUrl: null },
    });
    prisma.fundContribution.findFirst.mockResolvedValue(null);

    await expect(service.confirmContribution('trip-1', 'missing', 'u1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('evaluates clearly overpriced expenses as NGUY_CO_CAO', async () => {
    prisma.trip.findUnique.mockResolvedValue({
      destination: 'Da Nang',
    });

    const result = await service.evaluateCostBenchmark('trip-1', {
      title: 'Hai san',
      amount: new Prisma.Decimal('260000'),
      category: 'FOOD',
      currency: 'VND',
    });

    expect(result.severity).toBe('NGUY_CO_CAO');
    expect(result.confidenceLabel).toBe('Gợi ý');
    expect(result.benchmarkMedianAmount).toBe('90000');
  });

  it('falls back to Cần xem lại when destination-category data is missing', async () => {
    prisma.trip.findUnique.mockResolvedValue({
      destination: 'Da Nang',
    });

    const result = await service.evaluateCostBenchmark('trip-1', {
      title: 'Vien phi',
      amount: new Prisma.Decimal('500000'),
      category: 'EMERGENCY',
      currency: 'VND',
      quantityHint: '1 lan',
    });

    expect(result.severity).toBe('CAN_XEM_LAI');
    expect(result.confidenceLabel).toBe('Cần xem lại');
    expect(result.note).toContain('Kiểm tra thêm số lượng');
  });
});

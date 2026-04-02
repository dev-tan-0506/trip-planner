import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocalExpertService } from './local-expert.service';

describe('LocalExpertService', () => {
  let service: LocalExpertService;

  const tripId = 'trip-local-expert';
  const userId = 'user-local-expert';
  const mockPrismaService = {
    tripMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalExpertService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LocalExpertService>(LocalExpertService);
    jest.clearAllMocks();
    mockPrismaService.tripMember.findUnique.mockResolvedValue({
      id: 'member-1',
      tripId,
      userId,
      role: 'MEMBER',
    });
  });

  it('returns structured menu translation cards with uncertainty labeling', async () => {
    const result = await service.translateMenu(tripId, userId, {
      menuText: 'Muc nuong sa',
      localeHint: 'en',
    });

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]).toEqual(
      expect.objectContaining({
        originalText: 'Muc nuong sa',
        translatedText: 'Seafood dish',
        confidenceLabel: 'Cần xem lại',
        nextAction: expect.any(String),
      }),
    );
    expect(result.confidenceLabel).toBe('Cần xem lại');
  });

  it('limits hidden spot responses to compact cards', async () => {
    const result = await service.requestHiddenSpots(tripId, userId, {
      areaLabel: 'Hai Chau',
      vibe: 'yen tinh',
      budgetHint: 're',
    });

    expect(result.cards).toHaveLength(3);
    expect(result.cards.every((card) => typeof card.whyItFits === 'string')).toBe(true);
  });

  it('returns exactly three outfit cards at most', async () => {
    const result = await service.requestOutfitPlan(tripId, userId, {
      dayIndex: 1,
      aestheticHint: 'noi bat',
      weatherLabel: 'mua nhe',
      activityLabels: ['di bo', 'an toi'],
    });

    expect(result.cards).toHaveLength(3);
    expect(result.cards[2].confidenceLabel).toBe('Cần xem lại');
  });

  it('rejects access when the user is not a trip member', async () => {
    mockPrismaService.tripMember.findUnique.mockResolvedValue(null);

    await expect(
      service.requestOutfitPlan(tripId, userId, {
        dayIndex: 0,
        aestheticHint: 'toi gian',
        weatherLabel: 'nang',
        activityLabels: [],
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DailyPodcastService } from './daily-podcast.service';

describe('DailyPodcastService', () => {
  let service: DailyPodcastService;

  const tripId = 'trip-daily-podcast';
  const userId = 'user-daily-podcast';
  const baseTrip = {
    id: tripId,
    name: 'Trip podcast',
    destination: 'Da Nang',
    startDate: new Date('2026-06-01T00:00:00.000Z'),
    endDate: new Date('2026-06-03T00:00:00.000Z'),
    itineraryItems: [
      { title: 'Bun cha ca', sortOrder: 0, startMinute: 540 },
      { title: 'Cau Rong', sortOrder: 1, startMinute: 780 },
    ],
    attendanceSessions: [{ title: 'Tap trung toi', submissions: [{ locationStatus: 'GRANTED' }] }],
    tripFund: {
      expenses: [{ title: 'An toi', amount: new Prisma.Decimal('120000'), category: 'FOOD' }],
      contributions: [{ declaredAmount: new Prisma.Decimal('300000'), status: 'CONFIRMED' }],
    },
    safetyAlerts: [],
  };

  const mockPrismaService = {
    tripMember: {
      findUnique: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
    dailyPodcastRecap: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyPodcastService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DailyPodcastService>(DailyPodcastService);
    jest.clearAllMocks();
    mockPrismaService.tripMember.findUnique.mockResolvedValue({
      id: 'member-1',
      tripId,
      userId,
      role: 'MEMBER',
    });
    mockPrismaService.trip.findUnique.mockResolvedValue(baseTrip);
    mockPrismaService.dailyPodcastRecap.findUnique.mockResolvedValue(null);
    mockPrismaService.dailyPodcastRecap.upsert.mockImplementation(async ({ create }) => ({
      id: 'recap-1',
      generatedAt: new Date('2026-06-01T18:00:00.000Z'),
      createdAt: new Date('2026-06-01T18:00:00.000Z'),
      updatedAt: new Date('2026-06-01T18:00:00.000Z'),
      ...create,
    }));
  });

  it('creates a transcript within the length guardrails and caps duration at 120 seconds', async () => {
    const result = await service.generateDailyPodcast(tripId, 0, userId, {
      tone: 'playful',
      refresh: true,
    });

    const wordCount = result.transcript.split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(220);
    expect(wordCount).toBeLessThanOrEqual(300);
    expect(result.durationSeconds).toBeLessThanOrEqual(120);
  });

  it('persists the browser tts fallback when no dedicated audio asset exists', async () => {
    const result = await service.generateDailyPodcast(tripId, 0, userId, {
      tone: 'playful',
      refresh: true,
    });

    expect(result.audioMode).toBe('BROWSER_TTS');
    expect(result.audioUrl).toBeNull();
  });

  it('rejects access when the user is not a trip member', async () => {
    mockPrismaService.tripMember.findUnique.mockResolvedValue(null);

    await expect(
      service.generateDailyPodcast(tripId, 0, userId, {
        tone: 'playful',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});

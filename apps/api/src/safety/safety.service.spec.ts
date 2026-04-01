import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SafetyService } from './safety.service';
import { WeatherProvider } from './provider/weather.provider';
import { CrowdProvider } from './provider/crowd.provider';
import { DirectoryProvider } from './provider/directory.provider';

describe('SafetyService', () => {
  let service: SafetyService;
  const mockPrisma = {
    tripMember: {
      findUnique: jest.fn(),
    },
    safetyDirectoryEntry: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    safetyAlert: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SafetyService,
        WeatherProvider,
        CrowdProvider,
        DirectoryProvider,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(SafetyService);
    jest.clearAllMocks();
  });

  it('returns weather, crowd and directory overview', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-1',
      tripId: 'trip-1',
      role: 'LEADER',
      trip: { destination: 'Da Nang', startDate: new Date('2026-06-10') },
      user: { id: 'u1', name: 'Leader', avatarUrl: null },
    });
    mockPrisma.safetyDirectoryEntry.findMany.mockResolvedValue([]);
    mockPrisma.safetyDirectoryEntry.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({
        id: `dir-${Date.now()}`,
        ...data,
      }),
    );

    const result = await service.getSafetyOverview('trip-1', 'u1');
    expect(result.weather).toHaveLength(5);
    expect(result.crowd.length).toBeGreaterThan(0);
    expect(result.directoryQuickPicks.length).toBeGreaterThan(0);
  });

  it('rejects non-members from warning snapshot', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue(null);
    await expect(service.getWarnings('trip-1', 'stranger')).rejects.toThrow(ForbiddenException);
  });

  it('resolves an existing SOS alert', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-1',
      tripId: 'trip-1',
      role: 'LEADER',
      trip: { destination: 'Da Nang', startDate: new Date('2026-06-10') },
      user: { id: 'u1', name: 'Leader', avatarUrl: null },
    });
    mockPrisma.safetyAlert.findFirst.mockResolvedValue({
      id: 'alert-1',
      tripId: 'trip-1',
      status: 'ACKNOWLEDGED',
    });
    mockPrisma.safetyAlert.findMany.mockResolvedValue([
      {
        id: 'alert-1',
        tripId: 'trip-1',
        type: 'SOS',
        status: 'RESOLVED',
        message: 'Ổn rồi',
        createdAt: new Date('2026-06-10T10:00:00Z'),
        linkedItineraryItemId: null,
        createdBy: null,
      },
    ]);

    const result = await service.resolveAlert('trip-1', 'alert-1', 'u1');

    expect(mockPrisma.safetyAlert.update).toHaveBeenCalledWith({
      where: { id: 'alert-1' },
      data: {
        status: 'RESOLVED',
      },
    });
    expect(result.alerts[0].status).toBe('RESOLVED');
  });

  it('throws when resolving a missing alert', async () => {
    mockPrisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-1',
      tripId: 'trip-1',
      role: 'LEADER',
      trip: { destination: 'Da Nang', startDate: new Date('2026-06-10') },
      user: { id: 'u1', name: 'Leader', avatarUrl: null },
    });
    mockPrisma.safetyAlert.findFirst.mockResolvedValue(null);

    await expect(service.resolveAlert('trip-1', 'missing', 'u1')).rejects.toThrow(NotFoundException);
  });
});

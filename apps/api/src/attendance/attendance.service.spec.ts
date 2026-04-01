import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceService } from './attendance.service';
import { ProofStorageService } from './proof-storage.service';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockPrisma = {
    tripMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    attendanceSession: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    attendanceSubmission: {
      upsert: jest.fn(),
    },
  };

  const mockProofStorageService = {
    saveProofImage: jest.fn(),
  };

  let prisma: typeof mockPrisma;
  let proofStorageService: typeof mockProofStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProofStorageService, useValue: mockProofStorageService },
      ],
    }).compile();

    service = module.get(AttendanceService);
    prisma = mockPrisma;
    proofStorageService = mockProofStorageService;
    jest.clearAllMocks();
  });

  it('prevents non-leader from opening session', async () => {
    prisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-member',
      role: 'MEMBER',
      user: { id: 'user-1', name: 'Member', avatarUrl: null },
    });

    await expect(
      service.createSession('trip-1', 'user-1', {
        title: 'Điểm hẹn',
        meetingLabel: 'Bến xe',
        meetingAddress: '123 Test',
        opensAt: new Date().toISOString(),
        closesAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects proof submission after close time', async () => {
    prisma.attendanceSession.findUnique.mockResolvedValue({
      id: 'session-1',
      tripId: 'trip-1',
      status: 'OPEN',
      closesAt: new Date(Date.now() - 1000),
    });
    prisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-member',
      role: 'MEMBER',
      user: { id: 'user-1', name: 'Member', avatarUrl: null },
    });

    await expect(
      service.submitProof('session-1', 'user-1', {
        imageDataUrl: 'data:image/png;base64,AAAA',
        locationStatus: 'UNAVAILABLE',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('stores proof and upserts submission when location is optional', async () => {
    prisma.attendanceSession.findUnique.mockResolvedValue({
      id: 'session-1',
      tripId: 'trip-1',
      status: 'OPEN',
      closesAt: new Date(Date.now() + 1000 * 60 * 15),
    });
    prisma.tripMember.findUnique.mockResolvedValue({
      id: 'tm-member',
      role: 'MEMBER',
      user: { id: 'user-1', name: 'Member', avatarUrl: null },
    });
    proofStorageService.saveProofImage.mockResolvedValue('/attendance-proofs/session-1-tm-member.png');
    prisma.attendanceSession.findFirst.mockResolvedValue({
      id: 'session-1',
      tripId: 'trip-1',
      title: 'Điểm hẹn',
      meetingLabel: 'Bến xe',
      meetingAddress: '123 Test',
      lat: null,
      lng: null,
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 1000 * 60 * 15),
      status: 'OPEN',
      submissions: [],
    });
    prisma.tripMember.findMany.mockResolvedValue([]);

    await service.submitProof('session-1', 'user-1', {
      imageDataUrl: 'data:image/png;base64,AAAA',
      locationStatus: 'UNAVAILABLE',
    });

    expect(proofStorageService.saveProofImage).toHaveBeenCalled();
    expect(prisma.attendanceSubmission.upsert).toHaveBeenCalled();
  });
});

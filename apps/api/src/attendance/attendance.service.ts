import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { CreateAttendanceSubmissionDto } from './dto/create-attendance-submission.dto';
import { ProofStorageService } from './proof-storage.service';

type AttendanceLocationStatusValue = 'GRANTED' | 'DENIED' | 'UNAVAILABLE';
type AttendanceSessionStatusValue = 'OPEN' | 'CLOSED';

const AttendanceLocationStatus = {
  GRANTED: 'GRANTED' as AttendanceLocationStatusValue,
  DENIED: 'DENIED' as AttendanceLocationStatusValue,
  UNAVAILABLE: 'UNAVAILABLE' as AttendanceLocationStatusValue,
};

const AttendanceSessionStatus = {
  OPEN: 'OPEN' as AttendanceSessionStatusValue,
  CLOSED: 'CLOSED' as AttendanceSessionStatusValue,
};

type AttendanceSubmissionRecord = {
  tripMemberId: string;
  submittedAt: Date;
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
  accuracyMeters: number | null;
  locationStatus: AttendanceLocationStatusValue;
};

type AttendanceMemberRecord = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

type AttendanceRow = {
  tripMemberId: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  hasSubmitted: boolean;
  submittedAt: string | null;
  status: 'ARRIVED' | 'MISSING' | 'NO_LOCATION';
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
  accuracyMeters: number | null;
  locationStatus: AttendanceLocationStatusValue | null;
};

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly proofStorageService: ProofStorageService,
  ) {}

  private async getMembershipOrFail(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    return member;
  }

  private async getLatestSession(tripId: string) {
    return this.prisma.attendanceSession.findFirst({
      where: { tripId },
      include: {
        submissions: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCurrentAttendanceSnapshot(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);

    const [members, session] = await Promise.all([
      this.prisma.tripMember.findMany({
        where: { tripId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      }),
      this.getLatestSession(tripId),
    ]);

    const submissionEntries: Array<[string, AttendanceSubmissionRecord]> = (
      session?.submissions ?? []
    ).map((submission: AttendanceSubmissionRecord) => [submission.tripMemberId, submission]);
    const submissionsByMemberId = new Map<string, AttendanceSubmissionRecord>(submissionEntries);

    const rows: AttendanceRow[] = members.map((tripMember: AttendanceMemberRecord) => {
      const submission = submissionsByMemberId.get(tripMember.id);
      const hasLocation =
        submission?.locationStatus === AttendanceLocationStatus.GRANTED &&
        submission.lat != null &&
        submission.lng != null;

      const status = !submission
        ? 'MISSING'
        : hasLocation
          ? 'ARRIVED'
          : 'NO_LOCATION';

      return {
        tripMemberId: tripMember.id,
        userId: tripMember.user.id,
        name: tripMember.user.name,
        avatarUrl: tripMember.user.avatarUrl,
        role: tripMember.role,
        hasSubmitted: !!submission,
        submittedAt: submission?.submittedAt.toISOString() ?? null,
        status,
        photoUrl: submission?.photoUrl ?? null,
        lat: submission?.lat ?? null,
        lng: submission?.lng ?? null,
        accuracyMeters: submission?.accuracyMeters ?? null,
        locationStatus: submission?.locationStatus ?? null,
      };
    });

    const orderedRows = [...rows].sort((left, right) => {
      const priority = { MISSING: 0, NO_LOCATION: 1, ARRIVED: 2 } as const;
      return (
        priority[left.status as keyof typeof priority] -
          priority[right.status as keyof typeof priority] ||
        (left.name ?? '').localeCompare(right.name ?? '')
      );
    });

    return {
      tripId,
      isLeader: member.role === 'LEADER',
      currentTripMemberId: member.id,
      session: session
        ? {
            id: session.id,
            tripId: session.tripId,
            title: session.title,
            meetingLabel: session.meetingLabel,
            meetingAddress: session.meetingAddress,
            lat: session.lat,
            lng: session.lng,
            opensAt: session.opensAt.toISOString(),
            closesAt: session.closesAt.toISOString(),
            status: session.status,
          }
        : null,
      counts: {
        arrived: rows.filter((row: AttendanceRow) => row.status === 'ARRIVED').length,
        missing: rows.filter((row: AttendanceRow) => row.status === 'MISSING').length,
        noLocation: rows.filter((row: AttendanceRow) => row.status === 'NO_LOCATION').length,
      },
      mapPoints: rows
        .filter((row: AttendanceRow) => row.lat != null && row.lng != null)
        .map((row: AttendanceRow) => ({
          tripMemberId: row.tripMemberId,
          name: row.name,
          lat: row.lat as number,
          lng: row.lng as number,
          status: row.status === 'ARRIVED' ? 'ARRIVED' : 'NO_LOCATION',
        })),
      members: orderedRows,
    };
  }

  async createSession(tripId: string, userId: string, dto: CreateAttendanceSessionDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    if (member.role !== 'LEADER') {
      throw new ForbiddenException('Only leaders can open check-in');
    }

    const opensAt = new Date(dto.opensAt);
    const closesAt = new Date(dto.closesAt);
    if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime()) || closesAt <= opensAt) {
      throw new BadRequestException('Invalid check-in window');
    }

    await this.prisma.attendanceSession.updateMany({
      where: { tripId, status: AttendanceSessionStatus.OPEN },
      data: { status: AttendanceSessionStatus.CLOSED },
    });

    const session = await this.prisma.attendanceSession.create({
      data: {
        tripId,
        createdByTripMemberId: member.id,
        title: dto.title,
        meetingLabel: dto.meetingLabel,
        meetingAddress: dto.meetingAddress,
        lat: dto.lat,
        lng: dto.lng,
        opensAt,
        closesAt,
      },
    });

    return {
      sessionId: session.id,
      snapshot: await this.getCurrentAttendanceSnapshot(tripId, userId),
    };
  }

  async submitProof(
    sessionId: string,
    userId: string,
    dto: CreateAttendanceSubmissionDto,
  ) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    const member = await this.getMembershipOrFail(session.tripId, userId);
    const now = new Date();
    if (session.status !== AttendanceSessionStatus.OPEN || now > session.closesAt) {
      throw new BadRequestException('This check-in session is already closed');
    }

    const photoUrl = dto.imageDataUrl
      ? await this.proofStorageService.saveProofImage(sessionId, member.id, dto.imageDataUrl)
      : null;

    await this.prisma.attendanceSubmission.upsert({
      where: {
        sessionId_tripMemberId: {
          sessionId,
          tripMemberId: member.id,
        },
      },
      create: {
        sessionId,
        tripMemberId: member.id,
        photoUrl,
        lat: dto.locationStatus === AttendanceLocationStatus.GRANTED ? dto.lat : null,
        lng: dto.locationStatus === AttendanceLocationStatus.GRANTED ? dto.lng : null,
        accuracyMeters:
          dto.locationStatus === AttendanceLocationStatus.GRANTED ? dto.accuracyMeters : null,
        locationStatus: dto.locationStatus,
      },
      update: {
        photoUrl,
        submittedAt: now,
        lat: dto.locationStatus === AttendanceLocationStatus.GRANTED ? dto.lat : null,
        lng: dto.locationStatus === AttendanceLocationStatus.GRANTED ? dto.lng : null,
        accuracyMeters:
          dto.locationStatus === AttendanceLocationStatus.GRANTED ? dto.accuracyMeters : null,
        locationStatus: dto.locationStatus,
      },
    });

    return {
      tripId: session.tripId,
      sessionId,
      snapshot: await this.getCurrentAttendanceSnapshot(session.tripId, userId),
    };
  }

  async closeSession(sessionId: string, userId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    const member = await this.getMembershipOrFail(session.tripId, userId);
    if (member.role !== 'LEADER') {
      throw new ForbiddenException('Only leaders can close check-in');
    }

    await this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        status: AttendanceSessionStatus.CLOSED,
      },
    });

    return {
      tripId: session.tripId,
      sessionId,
      snapshot: await this.getCurrentAttendanceSnapshot(session.tripId, userId),
    };
  }
}

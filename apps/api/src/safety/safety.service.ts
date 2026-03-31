import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DirectoryProvider } from './provider/directory.provider';
import { CrowdProvider } from './provider/crowd.provider';
import { WeatherProvider } from './provider/weather.provider';
import { CreateSosAlertDto } from './dto/create-sos-alert.dto';

@Injectable()
export class SafetyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherProvider: WeatherProvider,
    private readonly crowdProvider: CrowdProvider,
    private readonly directoryProvider: DirectoryProvider,
  ) {}

  private async getMembershipOrFail(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { tripId, userId } },
      include: {
        trip: true,
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

  private buildEmergencyQuickDial() {
    return [
      { label: '113', phone: '113' },
      { label: '114', phone: '114' },
      { label: '115', phone: '115' },
    ];
  }

  async getSafetyOverview(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const [weather, crowd, persistedDirectory] = await Promise.all([
      this.weatherProvider.getFiveDayForecast(member.trip.destination),
      this.crowdProvider.getCrowdForecast(member.trip.destination),
      this.prisma.safetyDirectoryEntry.findMany({
        where: {
          OR: [{ tripId }, { tripId: null }],
        },
        orderBy: [{ verifiedAt: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    let directory = persistedDirectory;
    if (directory.length === 0) {
      const stubEntries = await this.directoryProvider.getSafetyDirectory(member.trip.destination);
      directory = await Promise.all(
        stubEntries.map((item) =>
          this.prisma.safetyDirectoryEntry.create({
            data: {
              tripId,
              kind: item.kind,
              title: item.title,
              phone: item.phone,
              address: item.address,
              lat: item.lat ?? undefined,
              lng: item.lng ?? undefined,
              source: item.source,
              verifiedAt: new Date(),
            },
          }),
        ),
      );
    }

    return {
      tripId,
      destinationLabel: member.trip.destination,
      contextLabel: `${member.trip.destination} • ${member.trip.startDate.toISOString().slice(0, 10)}`,
      weather,
      crowd,
      directoryQuickPicks: directory.slice(0, 3).map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        phone: item.phone,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        source: item.source,
        verifiedAt: item.verifiedAt?.toISOString() ?? null,
      })),
    };
  }

  async getSafetyDirectory(tripId: string, userId: string) {
    await this.getMembershipOrFail(tripId, userId);
    const entries = await this.prisma.safetyDirectoryEntry.findMany({
      where: {
        OR: [{ tripId }, { tripId: null }],
      },
      orderBy: [{ verifiedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return entries.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      phone: item.phone,
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      source: item.source,
      verifiedAt: item.verifiedAt?.toISOString() ?? null,
    }));
  }

  async getWarnings(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const alerts = await this.prisma.safetyAlert.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      tripId,
      warnings: [
        {
          id: 'culture-1',
          title: 'Lưu ý văn hóa',
          message: `Nếu cả nhóm ghé ${member.trip.destination}, nhớ chuẩn bị trang phục lịch sự cho điểm tôn giáo hoặc nơi trang nghiêm.`,
          linkedItineraryItemId: null,
        },
      ],
      alerts: alerts.map((item) => ({
        id: item.id,
        type: item.type,
        status: item.status,
        message: item.message,
        createdAt: item.createdAt.toISOString(),
        linkedItineraryItemId: item.linkedItineraryItemId,
        createdBy: item.createdBy
          ? {
              tripMemberId: item.createdBy.id,
              userId: item.createdBy.user.id,
              name: item.createdBy.user.name,
            }
          : null,
      })),
      quickDial: this.buildEmergencyQuickDial(),
    };
  }

  async createSosAlert(tripId: string, userId: string, dto: CreateSosAlertDto) {
    const member = await this.getMembershipOrFail(tripId, userId);

    await this.prisma.safetyAlert.create({
      data: {
        tripId,
        type: 'SOS',
        status: 'OPEN',
        message: dto.message?.trim() || `${member.user.name ?? 'Một thành viên'} đang cần hỗ trợ gấp.`,
        createdByTripMemberId: member.id,
        linkedItineraryItemId: dto.linkedItineraryItemId,
      },
    });

    return this.getWarnings(tripId, userId);
  }

  async acknowledgeAlert(tripId: string, alertId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const alert = await this.prisma.safetyAlert.findFirst({
      where: { id: alertId, tripId },
    });

    if (!alert) {
      throw new NotFoundException('Safety alert not found');
    }

    await this.prisma.safetyAlert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedByTripMemberId: member.id,
      },
    });

    return this.getWarnings(tripId, userId);
  }

  async resolveAlert(tripId: string, alertId: string, userId: string) {
    await this.getMembershipOrFail(tripId, userId);
    const alert = await this.prisma.safetyAlert.findFirst({
      where: { id: alertId, tripId },
    });

    if (!alert) {
      throw new NotFoundException('Safety alert not found');
    }

    await this.prisma.safetyAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
      },
    });

    return this.getWarnings(tripId, userId);
  }
}

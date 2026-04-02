import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VaultStorageService } from './vault-storage.service';
import { UploadVaultDocumentDto } from './dto/upload-vault-document.dto';
import { ReviewVaultDocumentDto } from './dto/review-vault-document.dto';
import { SubmitAnonymousFeedbackDto } from './dto/submit-anonymous-feedback.dto';
import { ReunionInviteMailerService } from './reunion-invite-mailer.service';
import { RespondReunionAvailabilityDto } from './dto/respond-reunion-availability.dto';
import { FinalizeReunionInviteDto } from './dto/finalize-reunion-invite.dto';

@Injectable()
export class MemoriesService implements OnModuleInit, OnModuleDestroy {
  private reunionTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly vaultStorageService: VaultStorageService,
    private readonly reunionInviteMailerService: ReunionInviteMailerService,
  ) {}

  onModuleInit() {
    this.reunionTimer = setInterval(() => {
      void this.dispatchDueReunionInvites();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.reunionTimer) {
      clearInterval(this.reunionTimer);
      this.reunionTimer = null;
    }
  }

  async getVaultSnapshot(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const isLeader = member.role === 'LEADER';

    const documents = await this.prisma.vaultDocument.findMany({
      where: isLeader
        ? { tripId }
        : {
            tripId,
            uploadedByTripMemberId: member.id,
          },
      include: {
        uploadedBy: {
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
        reviewedBy: {
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
      orderBy: [{ createdAt: 'desc' }],
    });

    return {
      tripId,
      isLeader,
      currentTripMemberId: member.id,
      retentionLabel: 'Tài liệu trong Kho tạm được giữ đến 7 ngày sau khi chuyến đi kết thúc.',
      supportedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      documents: documents.map((document) => ({
        id: document.id,
        kind: document.kind,
        status: document.status,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileUrl: document.fileUrl,
        note: document.note,
        expiresAt: document.expiresAt.toISOString(),
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        uploadedBy: {
          tripMemberId: document.uploadedBy.id,
          userId: document.uploadedBy.user.id,
          name: document.uploadedBy.user.name,
          avatarUrl: document.uploadedBy.user.avatarUrl,
        },
        reviewedAt: document.reviewedByTripMemberId ? document.updatedAt.toISOString() : null,
        reviewedBy: document.reviewedBy
          ? {
              tripMemberId: document.reviewedBy.id,
              userId: document.reviewedBy.user.id,
              name: document.reviewedBy.user.name,
              avatarUrl: document.reviewedBy.user.avatarUrl,
            }
          : null,
      })),
    };
  }

  async uploadVaultDocument(
    tripId: string,
    userId: string,
    dto: UploadVaultDocumentDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const trip = await this.getTripOrFail(tripId);

    const fileUrl = await this.vaultStorageService.saveDocument(
      tripId,
      member.id,
      dto.fileName,
      dto.mimeType,
      dto.fileDataUrl,
    );

    const expiresAt = new Date(trip.endDate);
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.vaultDocument.create({
      data: {
        tripId,
        uploadedByTripMemberId: member.id,
        kind: dto.documentKind,
        status: 'PENDING_REVIEW',
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        fileUrl,
        note: dto.note,
        expiresAt,
      },
    });

    return this.getVaultSnapshot(tripId, userId);
  }

  async reviewVaultDocument(
    tripId: string,
    userId: string,
    documentId: string,
    dto: ReviewVaultDocumentDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const document = await this.prisma.vaultDocument.findFirst({
      where: {
        id: documentId,
        tripId,
      },
    });

    if (!document) {
      throw new NotFoundException('Vault document not found');
    }

    await this.prisma.vaultDocument.update({
      where: { id: documentId },
      data: {
        status: dto.status,
        reviewedByTripMemberId: member.id,
      },
    });

    return this.getVaultSnapshot(tripId, userId);
  }

  async getFeedbackSnapshot(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const trip = await this.getTripOrFail(tripId);
    const poll = await this.ensureFeedbackPoll(tripId, trip.endDate);

    const receipt = poll
      ? await this.prisma.feedbackSubmissionReceipt.findFirst({
          where: {
            pollId: poll.id,
            tripMemberId: member.id,
          },
        })
      : null;

    const submissions = poll
      ? await this.prisma.anonymousFeedbackSubmission.findMany({
          where: { pollId: poll.id },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const moodBreakdown = [1, 2, 3, 4, 5].map((score) => ({
      score,
      count: submissions.filter((submission) => submission.moodScore === score).length,
    }));

    return {
      tripId,
      isLeader: member.role === 'LEADER',
      currentTripMemberId: member.id,
      status: poll?.status ?? 'LOCKED',
      isEligible: poll?.status !== 'LOCKED',
      canSubmit: poll?.status === 'OPEN' && !receipt,
      hasSubmitted: !!receipt,
      submittedCount: submissions.length,
      openedAt: poll?.openedAt?.toISOString() ?? null,
      closedAt: poll?.closedAt?.toISOString() ?? null,
      moodBreakdown,
      responses:
        member.role === 'LEADER'
          ? submissions.map((submission) => ({
              id: submission.id,
              moodScore: submission.moodScore,
              highlight: submission.highlight,
              wishNextTime: submission.wishNextTime,
              createdAt: submission.createdAt.toISOString(),
            }))
          : [],
    };
  }

  async submitAnonymousFeedback(
    tripId: string,
    userId: string,
    dto: SubmitAnonymousFeedbackDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const trip = await this.getTripOrFail(tripId);
    const poll = await this.ensureFeedbackPoll(tripId, trip.endDate);

    if (!poll || poll.status !== 'OPEN') {
      throw new BadRequestException('Chưa tới lúc mở góp ý ẩn danh');
    }

    const existingReceipt = await this.prisma.feedbackSubmissionReceipt.findFirst({
      where: {
        pollId: poll.id,
        tripMemberId: member.id,
      },
    });

    if (existingReceipt) {
      throw new BadRequestException('Bạn chỉ có thể gửi góp ý ẩn danh một lần');
    }

    const submission = await this.prisma.anonymousFeedbackSubmission.create({
      data: {
        tripId,
        pollId: poll.id,
        moodScore: dto.moodScore,
        highlight: dto.highlight,
        wishNextTime: dto.wishNextTime,
      },
    });

    await this.prisma.feedbackSubmissionReceipt.create({
      data: {
        tripId,
        pollId: poll.id,
        tripMemberId: member.id,
        submissionId: submission.id,
      },
    });

    return this.getFeedbackSnapshot(tripId, userId);
  }

  async closeFeedbackPoll(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);
    const trip = await this.getTripOrFail(tripId);
    const poll = await this.ensureFeedbackPoll(tripId, trip.endDate);

    if (!poll) {
      throw new BadRequestException('Chưa có poll góp ý để đóng');
    }

    await this.prisma.tripFeedbackPoll.update({
      where: { tripId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    return this.getFeedbackSnapshot(tripId, userId);
  }

  async getSouvenirSnapshot(tripId: string, userId: string) {
    await this.getMembershipOrFail(tripId, userId);
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { destination: true, endDate: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const today = new Date();
    const isFinalDay = today.toISOString().slice(0, 10) === trip.endDate.toISOString().slice(0, 10);

    return {
      tripId,
      eligible: isFinalDay,
      destinationLabel: trip.destination,
      reminderLabel: isFinalDay
        ? 'Mua quà trước khi về'
        : 'Souvenir reminder chỉ mở vào ngày cuối chuyến đi',
      suggestions: isFinalDay
        ? this.buildSouvenirSuggestions(trip.destination)
        : [],
    };
  }

  async dispatchDueReunionInvites() {
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - 7);

    const trips = await this.prisma.trip.findMany({
      where: {
        endDate: {
          lte: threshold,
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        reunionInvite: {
          include: {
            deliveries: true,
            availabilities: true,
          },
        },
      },
    });

    for (const trip of trips) {
      const existingDeliveries = trip.reunionInvite?.deliveries ?? [];
      const invite = trip.reunionInvite ??
        (await this.prisma.reunionInvite.create({
          data: {
            tripId: trip.id,
            title: `Hẹn reunion cho ${trip.name}`,
            message: `Đã tới lúc hẹn reunion sau chuyến ${trip.destination}.`,
            unlockedAt: now,
            suggestedDateOptions: this.buildSuggestedReunionDates(now),
            recommendedDate: this.buildSuggestedReunionDates(now)[0] ?? null,
          },
        }));

      if (invite.sentAt) {
        continue;
      }

      for (const member of trip.members) {
        const existingDelivery = existingDeliveries.find((delivery) => delivery.userId === member.userId);
        if (existingDelivery) continue;

        const delivery = await this.reunionInviteMailerService.sendInviteEmail(
          member.user.email,
          `Reunion: ${trip.name}`,
          `<p>Xin chào ${member.user.name ?? 'bạn'}, đã tới lúc hẹn reunion cho chuyến ${trip.destination}.</p>`,
        );

        await this.prisma.reunionInviteDelivery.create({
          data: {
            reunionInviteId: invite.id,
            userId: member.userId,
            recipientEmail: member.user.email,
            subjectLine: `Reunion: ${trip.name}`,
            status: delivery.status,
            sentAt: delivery.sentAt,
            errorMessage: delivery.errorMessage,
          },
        });
      }

      await this.prisma.reunionInvite.update({
        where: { id: invite.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    }
  }

  async getReunionSnapshot(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const trip = await this.getTripOrFail(tripId);
    await this.dispatchDueReunionInvites();

    const unlockAt = new Date(trip.endDate);
    unlockAt.setDate(unlockAt.getDate() + 7);
    const eligible = new Date() >= unlockAt;

    if (!eligible) {
      return {
        tripId,
        eligible: false,
        status: 'LOCKED',
        unlocksAt: unlockAt.toISOString(),
        suggestedDateOptions: [],
        recommendedDate: null,
        finalizedDate: null,
        deliveryStatus: [],
        availability: [],
      };
    }

    const invite = await this.prisma.reunionInvite.findUnique({
      where: { tripId },
      include: {
        deliveries: true,
        availabilities: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Reunion invite not found');
    }

    const recommendedDate = this.computeRecommendedDate(invite.availabilities, invite.suggestedDateOptions);

    return {
      tripId,
      eligible: true,
      isLeader: member.role === 'LEADER',
      status: invite.status,
      unlocksAt: unlockAt.toISOString(),
      title: invite.title,
      message: invite.message,
      suggestedDateOptions: invite.suggestedDateOptions,
      recommendedDate,
      finalizedDate: invite.finalizedDate,
      deliveryStatus: invite.deliveries.map((delivery) => ({
        recipientEmail: delivery.recipientEmail,
        status: delivery.status,
        sentAt: delivery.sentAt?.toISOString() ?? null,
        errorMessage: delivery.errorMessage,
      })),
      availability: invite.availabilities.map((row) => ({
        tripMemberId: row.tripMemberId,
        selectedDates: row.selectedDates,
        note: row.note,
      })),
    };
  }

  async respondReunionAvailability(tripId: string, userId: string, dto: RespondReunionAvailabilityDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const snapshot = await this.getReunionSnapshot(tripId, userId);
    if (!snapshot.eligible) {
      throw new BadRequestException('Chưa tới lúc hẹn reunion');
    }
    const invite = await this.prisma.reunionInvite.findUniqueOrThrow({ where: { tripId } });
    await this.prisma.reunionAvailability.upsert({
      where: {
        reunionInviteId_tripMemberId: {
          reunionInviteId: invite.id,
          tripMemberId: member.id,
        },
      },
      update: {
        selectedDates: dto.selectedDates,
        note: dto.note,
      },
      create: {
        reunionInviteId: invite.id,
        tripMemberId: member.id,
        selectedDates: dto.selectedDates,
        note: dto.note,
      },
    });
    return this.getReunionSnapshot(tripId, userId);
  }

  async finalizeReunionInvite(tripId: string, userId: string, dto: FinalizeReunionInviteDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);
    const snapshot = await this.getReunionSnapshot(tripId, userId);
    const allowedDates = new Set(
      [...snapshot.suggestedDateOptions, snapshot.recommendedDate].filter(Boolean) as string[],
    );
    if (!allowedDates.has(dto.finalizedDate)) {
      throw new BadRequestException('Ngày chốt phải thuộc danh sách gợi ý');
    }
    await this.prisma.reunionInvite.update({
      where: { tripId },
      data: {
        finalizedDate: dto.finalizedDate,
        recommendedDate: snapshot.recommendedDate,
      },
    });
    return this.getReunionSnapshot(tripId, userId);
  }

  private async getMembershipOrFail(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    return member;
  }

  private assertLeader(role: string) {
    if (role !== 'LEADER') {
      throw new ForbiddenException('Only leaders can perform this action');
    }
  }

  private async getTripOrFail(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, endDate: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (!(trip.endDate instanceof Date) || Number.isNaN(trip.endDate.getTime())) {
      throw new BadRequestException('Trip end date is invalid');
    }

    return trip;
  }

  private async ensureFeedbackPoll(tripId: string, endDate: Date) {
    const now = new Date();
    const eligible = now >= endDate;

    const existingPoll = await this.prisma.tripFeedbackPoll.findUnique({
      where: { tripId },
    });

    if (!existingPoll && !eligible) {
      return null;
    }

    if (!existingPoll && eligible) {
      return this.prisma.tripFeedbackPoll.create({
        data: {
          tripId,
          status: 'OPEN',
          openedAt: now,
        },
      });
    }

    if (existingPoll && existingPoll.status === 'LOCKED' && eligible) {
      return this.prisma.tripFeedbackPoll.update({
        where: { tripId },
        data: {
          status: 'OPEN',
          openedAt: existingPoll.openedAt ?? now,
        },
      });
    }

    return existingPoll;
  }

  private buildSouvenirSuggestions(destination: string) {
    return [
      {
        locationName: `${destination} Central Market`,
        locationType: 'Chợ',
        areaLabel: 'Khu gợi ý 1',
        reason: 'Dễ mua quà gọn cho cả nhóm vào ngày cuối.',
        souvenirHint: 'Đặc sản đóng gói và đồ thủ công nhỏ.',
      },
      {
        locationName: `${destination} Craft Street`,
        locationType: 'Phố quà',
        areaLabel: 'Khu gợi ý 2',
        reason: 'Có nhiều quầy thủ công địa phương, dễ chọn nhanh.',
        souvenirHint: 'Đồ lưu niệm mang dấu ấn địa phương.',
      },
    ];
  }

  private buildSuggestedReunionDates(from: Date) {
    const first = new Date(from);
    first.setDate(first.getDate() + 7);
    const second = new Date(from);
    second.setDate(second.getDate() + 14);
    const third = new Date(from);
    third.setDate(third.getDate() + 21);
    return [first, second, third].map((date) => date.toISOString().slice(0, 10));
  }

  private computeRecommendedDate(
    availabilities: Array<{ selectedDates: string[] }>,
    suggestedDateOptions: string[],
  ) {
    const counts = new Map<string, number>();
    for (const option of suggestedDateOptions) {
      counts.set(option, 0);
    }
    for (const availability of availabilities) {
      for (const date of availability.selectedDates) {
        counts.set(date, (counts.get(date) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? suggestedDateOptions[0] ?? null;
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingImportDraft, BookingImportDraftStatus, Prisma } from '@prisma/client';
import { ItineraryService } from '../itinerary/itinerary.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmBookingImportDto, ConfirmBookingImportItemDto } from './dto/confirm-booking-import.dto';
import { CreateBookingImportDraftDto } from './dto/create-booking-import-draft.dto';

type ParsedDraftItem = {
  title: string;
  locationName: string | null;
  startTime: string | null;
  endTime: string | null;
  bookingCode: string | null;
  missingFields: string[];
  rawExcerpt: string;
};

@Injectable()
export class BookingImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly itineraryService: ItineraryService,
  ) {}

  private async getMembershipOrFail(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
      include: {
        trip: {
          select: {
            id: true,
            joinCode: true,
          },
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    return member;
  }

  private buildForwardingAddress(joinCode: string) {
    return `booking+${joinCode}@minhdidauthe.local`;
  }

  private normalizeText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private extractTime(source: string) {
    const match = source.match(/\b([01]?\d|2[0-3])[:h]([0-5]\d)\b/);
    if (!match) {
      return null;
    }

    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }

  private extractBookingCode(source: string) {
    const match = source.match(/\b((?=[A-Z0-9]{5,}\b)[A-Z0-9]*\d[A-Z0-9]*)\b/i);
    return match ? match[1].toUpperCase() : null;
  }

  private parseRawContent(rawContent: string) {
    const lines = rawContent
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    const joined = lines.join(' ');
    const normalized = this.normalizeText(joined);

    const itemSources =
      lines.length > 1
        ? lines
        : rawContent
            .split(/(?:\.|\;)\s+/)
            .map((part) => part.trim())
            .filter(Boolean);

    const parsedItems = itemSources.slice(0, 6).map<ParsedDraftItem>((line, index) => {
      const startTime = this.extractTime(line);
      const bookingCode = this.extractBookingCode(line);
      const locationMatch = line.match(/\b(?:tai|o|den)\b\s+([^-|,]+)/i);
      const locationName = locationMatch ? locationMatch[1].trim() : null;
      const title =
        /khach san|hotel/i.test(line)
          ? 'Nhan phong'
          : /bay|flight|vn\d+/i.test(line)
            ? 'Chuyen bay'
            : /tau|train/i.test(line)
              ? 'Tau di chuyen'
              : /xe|bus/i.test(line)
                ? 'Chuyen xe'
                : index === 0
                  ? 'Dat cho du lich'
                  : `Muc dat cho ${index + 1}`;
      const missingFields = [
        !locationName ? 'locationName' : null,
        !startTime ? 'startTime' : null,
        !bookingCode ? 'bookingCode' : null,
      ].filter((value): value is string => Boolean(value));

      return {
        title,
        locationName,
        startTime,
        endTime: null,
        bookingCode,
        missingFields,
        rawExcerpt: line,
      };
    });

    const hasLowConfidence =
      parsedItems.some((item) => item.missingFields.length > 0) ||
      /co the|du kien|tam tinh|pending|cho xac nhan/.test(normalized);

    return {
      confidenceLabel: hasLowConfidence ? 'Cần xem lại' : 'Gợi ý',
      parseSummary: hasLowConfidence
        ? 'Đã tách nội dung đặt chỗ, nhưng còn thiếu hoặc mơ hồ một vài trường cần xem lại trước khi nhập vào lịch trình.'
        : 'Đã tách nội dung đặt chỗ thành bản nháp để đối chiếu trước khi nhập vào lịch trình.',
      parsedItems,
    };
  }

  private toDraftResponse(draft: BookingImportDraft) {
    return {
      id: draft.id,
      tripId: draft.tripId,
      createdByTripMemberId: draft.createdByTripMemberId,
      reviewedByTripMemberId: draft.reviewedByTripMemberId,
      sourceChannel: draft.sourceChannel,
      forwardingAddress: draft.forwardingAddress,
      sourceMessageId: draft.sourceMessageId,
      sourceSender: draft.sourceSender,
      sourceSubject: draft.sourceSubject,
      rawContent: draft.rawContent,
      confidenceLabel: draft.confidenceLabel,
      status: draft.status,
      parseSummary: draft.parseSummary,
      parsedItems: draft.parsedItems,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  private async createDraftRecord(input: {
    tripId: string;
    createdByTripMemberId?: string | null;
    sourceChannel: string;
    forwardingAddress: string;
    sourceMessageId?: string | null;
    sourceSender?: string | null;
    sourceSubject?: string | null;
    rawContent: string;
  }) {
    const parsed = this.parseRawContent(input.rawContent);
    const draft = await this.prisma.bookingImportDraft.create({
      data: {
        tripId: input.tripId,
        createdByTripMemberId: input.createdByTripMemberId ?? null,
        sourceChannel: input.sourceChannel,
        forwardingAddress: input.forwardingAddress,
        sourceMessageId: input.sourceMessageId ?? null,
        sourceSender: input.sourceSender ?? null,
        sourceSubject: input.sourceSubject ?? null,
        rawContent: input.rawContent,
        confidenceLabel: parsed.confidenceLabel,
        parseSummary: parsed.parseSummary,
        parsedItems: parsed.parsedItems as Prisma.InputJsonValue,
      },
    });

    return this.toDraftResponse(draft);
  }

  async getImportConfig(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    return {
      tripId,
      forwardingAddress: this.buildForwardingAddress(member.trip.joinCode),
      joinCode: member.trip.joinCode,
      manualPasteEnabled: true,
    };
  }

  async listDrafts(tripId: string, userId: string) {
    await this.getMembershipOrFail(tripId, userId);
    const drafts = await this.prisma.bookingImportDraft.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
    });

    return drafts.map((draft) => this.toDraftResponse(draft));
  }

  async createDraftFromRawContent(
    tripId: string,
    userId: string,
    dto: CreateBookingImportDraftDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    return this.createDraftRecord({
      tripId,
      createdByTripMemberId: member.id,
      sourceChannel: 'MANUAL_PASTE',
      forwardingAddress: this.buildForwardingAddress(member.trip.joinCode),
      sourceMessageId: dto.sourceMessageId,
      sourceSender: dto.sourceSender,
      sourceSubject: dto.sourceSubject,
      rawContent: dto.rawContent,
    });
  }

  async createDraftFromInbound(dto: {
    recipientAddress: string;
    rawContent: string;
    sourceSender?: string;
    sourceSubject?: string;
    sourceMessageId?: string;
  }) {
    const recipientMatch = dto.recipientAddress.match(/^booking\+([^@]+)@minhdidauthe\.local$/i);
    if (!recipientMatch) {
      throw new BadRequestException('Inbound recipient does not match booking forwarding format');
    }

    const joinCode = recipientMatch[1];
    const trip = await this.prisma.trip.findUnique({
      where: { joinCode },
      select: { id: true, joinCode: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found for inbound booking import');
    }

    return this.createDraftRecord({
      tripId: trip.id,
      sourceChannel: 'FORWARDED_EMAIL',
      forwardingAddress: this.buildForwardingAddress(trip.joinCode),
      sourceMessageId: dto.sourceMessageId,
      sourceSender: dto.sourceSender,
      sourceSubject: dto.sourceSubject,
      rawContent: dto.rawContent,
    });
  }

  async confirmBookingImportDraft(
    tripId: string,
    draftId: string,
    userId: string,
    dto: ConfirmBookingImportDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    if (member.role !== 'LEADER') {
      throw new ForbiddenException('Only the trip leader can confirm a booking import draft');
    }

    const draft = await this.prisma.bookingImportDraft.findFirst({
      where: { id: draftId, tripId },
    });

    if (!draft) {
      throw new NotFoundException('Booking import draft not found');
    }

    if (draft.status !== BookingImportDraftStatus.DRAFT) {
      throw new BadRequestException('Booking import draft has already been reviewed');
    }

    const parsedItems = (dto.parsedItems ??
      ((draft.parsedItems as unknown as ParsedDraftItem[]) || [])) as Array<
      ParsedDraftItem | ConfirmBookingImportItemDto
    >;

    if (parsedItems.length === 0) {
      throw new BadRequestException('Booking import draft has no parsed items to confirm');
    }

    let snapshot = null;
    for (const item of parsedItems) {
      snapshot = await this.itineraryService.createItem(tripId, userId, {
        title: item.title,
        dayIndex: 0,
        startTime: item.startTime ?? undefined,
        locationName: item.locationName ?? undefined,
        shortNote:
          [item.bookingCode ? `Ma dat cho: ${item.bookingCode}` : null, item.rawExcerpt ?? null]
            .filter(Boolean)
            .join(' | ')
            .slice(0, 250) || undefined,
      });
    }

    const updatedDraft = await this.prisma.bookingImportDraft.update({
      where: { id: draft.id },
      data: {
        reviewedByTripMemberId: member.id,
        status: BookingImportDraftStatus.CONFIRMED,
        parsedItems: parsedItems as Prisma.InputJsonValue,
      },
    });

    return {
      draft: this.toDraftResponse(updatedDraft),
      snapshot,
    };
  }
}

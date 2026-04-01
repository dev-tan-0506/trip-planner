import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { ReorderItineraryDto } from './dto/reorder-itinerary.dto';
import { RequestCulinaryRouteDto } from './dto/request-culinary-route.dto';
import { ApplyCulinaryRouteDto } from './dto/apply-culinary-route.dto';

export type ProgressState = 'sap toi' | 'dang di' | 'da di' | 'chua chot gio';

export interface OverlapWarning {
  itemId: string;
  conflictsWith: string;
  dayIndex: number;
  startMinute: number;
  message: string;
}

export interface MapItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  dayIndex: number;
  sortOrder: number;
}

export type HealthWarningSeverity = 'LUU_Y' | 'CAN_XEM_LAI' | 'NGUY_CO_CAO';
export type AiConfidenceLabel = 'Goi y' | 'Uoc luong' | 'Can xem lai';

export interface HealthWarning {
  itemId: string;
  severity: HealthWarningSeverity;
  title: string;
  message: string;
  confidenceLabel: AiConfidenceLabel;
  affectedMemberIds: string[];
}

export interface CulinaryRouteStop {
  itemId: string;
  title: string;
  dayIndex: number;
  sortOrder: number;
  lat: number | null;
  lng: number | null;
  reason: string;
}

export interface CulinaryRouteSuggestion {
  suggestionId: string;
  orderedItems: CulinaryRouteStop[];
  totalEstimatedMinutes: number;
  confidenceLabel: AiConfidenceLabel;
}

type SnapshotItem = {
  id: string;
  title: string;
  dayIndex: number;
  startMinute: number | null;
  lat: number | null;
  lng: number | null;
  sortOrder: number;
};

export interface ItineraryItemWithProgress {
  id: string;
  tripId: string;
  dayIndex: number;
  sortOrder: number;
  startMinute: number | null;
  startTime: string | null;
  title: string;
  locationName: string | null;
  locationAddress: string | null;
  placeId: string | null;
  lat: number | null;
  lng: number | null;
  shortNote: string | null;
  version: number;
  progress: ProgressState;
  proposalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayGroup {
  dayIndex: number;
  items: ItineraryItemWithProgress[];
}

export interface ItinerarySnapshot {
  tripId: string;
  days: DayGroup[];
  overlapWarnings: OverlapWarning[];
  healthWarnings: HealthWarning[];
  mapItems: MapItem[];
  totalItems: number;
  isLeader: boolean;
  canEdit: boolean;
}

type HealthSignal = {
  keyword: string;
  severity: HealthWarningSeverity;
  confidenceLabel: AiConfidenceLabel;
  title: string;
};

type ParsedHealthProfile = {
  memberId: string;
  signals: HealthSignal[];
  parserConfidence: AiConfidenceLabel;
};

const HIGH_RISK_KEYWORDS = ['di ung', 'allergy', 'allergic', 'anaphylaxis', 'khong an duoc'];
const SEAFOOD_KEYWORDS = ['hai san', 'tom hum', 'cua', 'tom', 'oc'];
const MOTION_KEYWORDS = ['say xe', 'motion sickness', 'tau xe'];
const VEGETARIAN_KEYWORDS = ['an chay', 'vegetarian', 'vegan'];

function normalizeVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Convert HH:mm to minutes since midnight.
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to HH:mm.
 */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Compute progress state for an itinerary item based on trip timezone.
 */
function computeProgress(
  startMinute: number | null,
  dayIndex: number,
  tripStartDate: Date,
  tripTimeZone: string,
): ProgressState {
  if (startMinute === null) {
    return 'chua chot gio';
  }

  const now = new Date();
  // Calculate the date for this day in the trip
  const itemDate = new Date(tripStartDate);
  itemDate.setDate(itemDate.getDate() + dayIndex);

  // Create the item's datetime
  const itemDateTime = new Date(itemDate);
  itemDateTime.setHours(Math.floor(startMinute / 60), startMinute % 60, 0, 0);

  // Assume 60 min default duration for progress calculation
  const itemEndDateTime = new Date(itemDateTime.getTime() + 60 * 60 * 1000);

  if (now < itemDateTime) {
    return 'sap toi';
  } else if (now >= itemDateTime && now < itemEndDateTime) {
    return 'dang di';
  } else {
    return 'da di';
  }
}

@Injectable()
export class ItineraryService {
  constructor(private prisma: PrismaService) {}

  private buildSuggestionId(tripId: string, itemIds: string[]): string {
    return `culinary-${tripId}-${itemIds.join('-')}-${Date.now().toString(36)}`;
  }

  private getDistanceMeters(
    a: { lat: number | null; lng: number | null },
    b: { lat: number | null; lng: number | null },
  ): number | null {
    if (a.lat === null || a.lng === null || b.lat === null || b.lng === null) {
      return null;
    }

    const dx = (a.lat - b.lat) * 111_000;
    const dy = (a.lng - b.lng) * 111_000;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }

  private estimateTravelMinutes(distanceMeters: number | null, travelMode: string): number {
    if (distanceMeters === null) {
      return 18;
    }

    const mode = normalizeVietnamese(travelMode);
    const metersPerMinute = mode === 'walking' ? 80 : 200;
    return Math.max(4, Math.round(distanceMeters / metersPerMinute));
  }

  private buildHopReason(
    current: { title: string; lat: number | null; lng: number | null },
    next: { title: string; lat: number | null; lng: number | null },
    travelMode: string,
  ): string {
    const distanceMeters = this.getDistanceMeters(current, next);
    if (distanceMeters === null) {
      return `Chuyen sang ${next.title} theo thu tu gan nhat hien co, can xem lai vi thieu toa do.`;
    }

    const minutes = this.estimateTravelMinutes(distanceMeters, travelMode);
    return `${next.title} nam tiep tuyen ${minutes} phut di chuyen tu ${current.title}.`;
  }

  private collectHealthKeywords(value: unknown, allowHighRisk: boolean): HealthSignal[] {
    if (typeof value !== 'string') {
      return [];
    }

    const normalized = normalizeVietnamese(value);
    const signals: HealthSignal[] = [];

    if (SEAFOOD_KEYWORDS.some((keyword) => normalized.includes(normalizeVietnamese(keyword)))) {
      signals.push({
        keyword: 'hai san',
        severity: allowHighRisk ? 'NGUY_CO_CAO' : 'CAN_XEM_LAI',
        confidenceLabel: allowHighRisk ? 'Uoc luong' : 'Can xem lai',
        title: allowHighRisk ? 'Nguy co an uong can tranh' : 'Thong tin suc khoe can xem lai',
      });
    }

    if (MOTION_KEYWORDS.some((keyword) => normalized.includes(normalizeVietnamese(keyword)))) {
      signals.push({
        keyword: 'di chuyen',
        severity: allowHighRisk ? 'LUU_Y' : 'CAN_XEM_LAI',
        confidenceLabel: allowHighRisk ? 'Goi y' : 'Can xem lai',
        title: 'Can luu y lich trinh di chuyen',
      });
    }

    if (VEGETARIAN_KEYWORDS.some((keyword) => normalized.includes(normalizeVietnamese(keyword)))) {
      signals.push({
        keyword: 'an chay',
        severity: allowHighRisk ? 'LUU_Y' : 'CAN_XEM_LAI',
        confidenceLabel: allowHighRisk ? 'Goi y' : 'Can xem lai',
        title: 'Can doi chieu nhu cau an uong',
      });
    }

    if (
      allowHighRisk &&
      HIGH_RISK_KEYWORDS.some((keyword) => normalized.includes(normalizeVietnamese(keyword))) &&
      !signals.some((signal) => signal.severity === 'NGUY_CO_CAO')
    ) {
      signals.push({
        keyword: 'di ung',
        severity: 'NGUY_CO_CAO',
        confidenceLabel: 'Uoc luong',
        title: 'Nguy co cao voi ho so suc khoe',
      });
    }

    return signals;
  }

  private parseHealthProfile(memberId: string, healthProfile: string | null): ParsedHealthProfile | null {
    if (!healthProfile) {
      return null;
    }

    try {
      const parsed = JSON.parse(healthProfile) as Record<string, unknown>;
      const candidates = Object.values(parsed).flatMap((value) =>
        Array.isArray(value) ? value.map(String) : [String(value)],
      );
      const signals = candidates.flatMap((value) => this.collectHealthKeywords(value, true));
      return {
        memberId,
        signals,
        parserConfidence: signals.length > 0 ? 'Uoc luong' : 'Goi y',
      };
    } catch {
      const signals = this.collectHealthKeywords(healthProfile, false);
      return {
        memberId,
        signals,
        parserConfidence: 'Can xem lai',
      };
    }
  }

  private buildHealthWarnings(
    items: Array<{
      id: string;
      title: string;
      locationName: string | null;
      shortNote: string | null;
    }>,
    members: Array<{ userId: string; user: { healthProfile: string | null } }>,
  ): HealthWarning[] {
    const profiles = members
      .map((member) => this.parseHealthProfile(member.userId, member.user.healthProfile))
      .filter((profile): profile is ParsedHealthProfile => Boolean(profile))
      .filter((profile) => profile.signals.length > 0);

    if (profiles.length === 0) {
      return [];
    }

    const warnings: HealthWarning[] = [];

    for (const item of items) {
      const itemText = normalizeVietnamese(
        [item.title, item.locationName, item.shortNote].filter(Boolean).join(' '),
      );
      const matchedSignals = profiles.flatMap((profile) =>
        profile.signals
          .filter((signal) => itemText.includes(normalizeVietnamese(signal.keyword)))
          .map((signal) => ({
            ...signal,
            memberId: profile.memberId,
            parserConfidence: profile.parserConfidence,
          })),
      );

      if (matchedSignals.length === 0) {
        continue;
      }

      const affectedMemberIds = Array.from(new Set(matchedSignals.map((signal) => signal.memberId)));
      const severity: HealthWarningSeverity = matchedSignals.some(
        (signal) => signal.severity === 'NGUY_CO_CAO',
      )
        ? 'NGUY_CO_CAO'
        : matchedSignals.some((signal) => signal.severity === 'CAN_XEM_LAI')
          ? 'CAN_XEM_LAI'
          : 'LUU_Y';
      const confidenceLabel: AiConfidenceLabel = matchedSignals.some(
        (signal) => signal.parserConfidence === 'Can xem lai',
      )
        ? 'Can xem lai'
        : matchedSignals.some((signal) => signal.confidenceLabel === 'Uoc luong')
          ? 'Uoc luong'
          : 'Goi y';

      warnings.push({
        itemId: item.id,
        severity,
        title:
          severity === 'NGUY_CO_CAO'
            ? 'Nguy co cao'
            : severity === 'CAN_XEM_LAI'
              ? 'Can xem lai'
              : 'Luu y',
        message:
          confidenceLabel === 'Can xem lai'
            ? 'Ho so suc khoe dang duoc doc theo tu khoa, nen xac nhan lai truoc khi chot mon.'
            : 'Muc nay co the xung dot voi nhu cau suc khoe cua mot vai thanh vien trong doan.',
        confidenceLabel,
        affectedMemberIds,
      });
    }

    return warnings;
  }

  private getTripDurationDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  private ensureDayIndexInRange(dayIndex: number, startDate: Date, endDate: Date) {
    const totalDays = this.getTripDurationDays(startDate, endDate);
    if (dayIndex < 0 || dayIndex >= totalDays) {
      throw new BadRequestException(
        `dayIndex must be between 0 and ${Math.max(totalDays - 1, 0)} for this trip`,
      );
    }
  }

  private compareItemsForTimeline(
    a: { startMinute: number | null; sortOrder: number; createdAt?: Date },
    b: { startMinute: number | null; sortOrder: number; createdAt?: Date },
  ) {
    if (a.startMinute !== null && b.startMinute !== null) {
      if (a.startMinute !== b.startMinute) {
        return a.startMinute - b.startMinute;
      }
      return a.sortOrder - b.sortOrder;
    }

    if (a.startMinute !== null) return -1;
    if (b.startMinute !== null) return 1;

    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    if (a.createdAt && b.createdAt) {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }

    return 0;
  }

  private async normalizeDaySortOrders(
    tripId: string,
    dayIndex: number,
  ): Promise<void> {
    const items = await this.prisma.itineraryItem.findMany({
      where: { tripId, dayIndex },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    if (items.length <= 1) {
      return;
    }

    const sorted = [...items].sort((a, b) => this.compareItemsForTimeline(a, b));

    await this.prisma.$transaction([
      ...sorted.map((item, index) =>
        this.prisma.itineraryItem.update({
          where: { id: item.id },
          data: { sortOrder: 1000 + index },
        }),
      ),
      ...sorted.map((item, index) =>
        this.prisma.itineraryItem.update({
          where: { id: item.id },
          data: { sortOrder: index + 1 },
        }),
      ),
    ]);
  }

  /**
   * Verify user is a trip member and return their role.
   */
  private async getMemberRole(
    tripId: string,
    userId: string,
  ): Promise<{ role: string; isMember: boolean; isLeader: boolean }> {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (!member) {
      return { role: '', isMember: false, isLeader: false };
    }

    return {
      role: member.role,
      isMember: true,
      isLeader: member.role === 'LEADER',
    };
  }

  /**
   * Enforce leader-only write access.
   */
  private async requireLeader(tripId: string, userId: string): Promise<void> {
    const { isMember, isLeader } = await this.getMemberRole(tripId, userId);

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    if (!isLeader) {
      throw new ForbiddenException(
        'Only the trip leader can modify the itinerary',
      );
    }
  }

  /**
   * Get next sortOrder for a given day, optionally after a specific item.
   */
  private async getNextSortOrder(
    tripId: string,
    dayIndex: number,
    startMinute: number | null,
    insertAfterItemId?: string,
  ): Promise<number> {
    if (insertAfterItemId) {
      const afterItem = await this.prisma.itineraryItem.findFirst({
        where: { id: insertAfterItemId, tripId },
      });

      if (afterItem) {
        // Shift all items after the target down to make room
        await this.prisma.itineraryItem.updateMany({
          where: {
            tripId,
            dayIndex,
            sortOrder: { gt: afterItem.sortOrder },
          },
          data: { sortOrder: { increment: 1 } },
        });
        return afterItem.sortOrder + 1;
      }
    }

    if (startMinute !== null) {
      const dayItems = await this.prisma.itineraryItem.findMany({
        where: { tripId, dayIndex },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      const nextTimedItem = [...dayItems]
        .sort((a, b) => this.compareItemsForTimeline(a, b))
        .find((item) => item.startMinute === null || item.startMinute > startMinute);

      if (nextTimedItem) {
        await this.prisma.itineraryItem.updateMany({
          where: {
            tripId,
            dayIndex,
            sortOrder: { gte: nextTimedItem.sortOrder },
          },
          data: { sortOrder: { increment: 1 } },
        });

        return nextTimedItem.sortOrder;
      }
    }

    // Append to end
    const lastItem = await this.prisma.itineraryItem.findFirst({
      where: { tripId, dayIndex },
      orderBy: { sortOrder: 'desc' },
    });

    return lastItem ? lastItem.sortOrder + 1 : 1;
  }

  /**
   * Detect time overlaps within the same day.
   */
  private detectOverlaps(
    items: { id: string; title: string; dayIndex: number; startMinute: number | null }[],
  ): OverlapWarning[] {
    const warnings: OverlapWarning[] = [];
    const timedItems = items
      .filter((i) => i.startMinute !== null)
      .sort((a, b) => a.startMinute! - b.startMinute!);

    for (let i = 0; i < timedItems.length; i++) {
      for (let j = i + 1; j < timedItems.length; j++) {
        const a = timedItems[i];
        const b = timedItems[j];

        if (a.dayIndex !== b.dayIndex) continue;

        // Two items overlap if they share the same start minute
        // or the next item starts within 30 min of the previous
        const diff = b.startMinute! - a.startMinute!;
        if (diff < 30) {
          warnings.push({
            itemId: b.id,
            conflictsWith: a.id,
            dayIndex: a.dayIndex,
            startMinute: b.startMinute!,
            message: `"${b.title}" (${minutesToTime(b.startMinute!)}) overlaps with "${a.title}" (${minutesToTime(a.startMinute!)})`,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Returns one server-computed snapshot of the trip itinerary.
   * Groups items by day, includes progress state, overlap warnings,
   * proposal counts, and map-ready items.
   */
  async getTripItinerarySnapshot(
    tripId: string,
    userId: string,
  ): Promise<ItinerarySnapshot> {
    const { isMember, isLeader } = await this.getMemberRole(tripId, userId);

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const items = await this.prisma.itineraryItem.findMany({
      where: { tripId },
      orderBy: [{ dayIndex: 'asc' }, { sortOrder: 'asc' }],
      include: {
        _count: {
          select: {
            proposals: {
              where: { status: 'PENDING' },
            },
          },
        },
      },
    });
    const members = await this.prisma.tripMember.findMany({
      where: { tripId },
      select: {
        userId: true,
        user: {
          select: {
            healthProfile: true,
          },
        },
      },
    });

    const totalDays = this.getTripDurationDays(trip.startDate, trip.endDate);

    // Group by day
    const dayMap = new Map<number, ItineraryItemWithProgress[]>();

    for (const item of items) {
      const progress = computeProgress(
        item.startMinute,
        item.dayIndex,
        trip.startDate,
        trip.timeZone,
      );

      const enriched: ItineraryItemWithProgress = {
        id: item.id,
        tripId: item.tripId,
        dayIndex: item.dayIndex,
        sortOrder: item.sortOrder,
        startMinute: item.startMinute,
        startTime: item.startMinute !== null ? minutesToTime(item.startMinute) : null,
        title: item.title,
        locationName: item.locationName,
        locationAddress: item.locationAddress,
        placeId: item.placeId,
        lat: item.lat,
        lng: item.lng,
        shortNote: item.shortNote,
        version: item.version,
        progress,
        proposalCount: item._count.proposals,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };

      if (!dayMap.has(item.dayIndex)) {
        dayMap.set(item.dayIndex, []);
      }
      dayMap.get(item.dayIndex)!.push(enriched);
    }

    // Sort days and build response
    const days: DayGroup[] = Array.from({ length: totalDays }, (_, dayIndex) => ({
      dayIndex,
      items: dayMap.get(dayIndex) ?? [],
    }));

    // Overlap warnings
    const overlapWarnings = this.detectOverlaps(
      items.map((i: SnapshotItem) => ({
        id: i.id,
        title: i.title,
        dayIndex: i.dayIndex,
        startMinute: i.startMinute,
      })),
    );
    const healthWarnings = this.buildHealthWarnings(items, members);

    // Map items (only items with lat/lng)
    const mapItems: MapItem[] = items
      .filter((i: SnapshotItem) => i.lat !== null && i.lng !== null)
      .map((i: SnapshotItem) => ({
        id: i.id,
        title: i.title,
        lat: i.lat!,
        lng: i.lng!,
        dayIndex: i.dayIndex,
        sortOrder: i.sortOrder,
      }));

    return {
      tripId,
      days,
      overlapWarnings,
      healthWarnings,
      mapItems,
      totalItems: items.length,
      isLeader,
      canEdit: isLeader,
    };
  }

  async requestCulinaryRoute(
    tripId: string,
    userId: string,
    dto: RequestCulinaryRouteDto,
  ): Promise<CulinaryRouteSuggestion> {
    const { isMember } = await this.getMemberRole(tripId, userId);

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    const uniqueItemIds = Array.from(new Set(dto.itemIds));
    const items = await this.prisma.itineraryItem.findMany({
      where: {
        tripId,
        id: { in: uniqueItemIds },
      },
      orderBy: [{ dayIndex: 'asc' }, { sortOrder: 'asc' }],
    });

    if (items.length !== uniqueItemIds.length) {
      throw new BadRequestException('One or more requested itinerary items do not belong to this trip');
    }

    const remaining = [...items].sort((a, b) => {
      const aHasCoords = a.lat !== null && a.lng !== null;
      const bHasCoords = b.lat !== null && b.lng !== null;
      if (aHasCoords !== bHasCoords) {
        return aHasCoords ? -1 : 1;
      }
      if (a.dayIndex !== b.dayIndex) {
        return a.dayIndex - b.dayIndex;
      }
      return a.sortOrder - b.sortOrder;
    });

    const ordered = [remaining.shift()!];

    while (remaining.length > 0) {
      const current = ordered[ordered.length - 1];
      remaining.sort((a, b) => {
        const distA = this.getDistanceMeters(current, a);
        const distB = this.getDistanceMeters(current, b);
        if (distA === null && distB === null) {
          if (a.dayIndex !== b.dayIndex) {
            return a.dayIndex - b.dayIndex;
          }
          return a.sortOrder - b.sortOrder;
        }
        if (distA === null) return 1;
        if (distB === null) return -1;
        if (distA !== distB) {
          return distA - distB;
        }
        if (a.dayIndex !== b.dayIndex) {
          return a.dayIndex - b.dayIndex;
        }
        return a.sortOrder - b.sortOrder;
      });
      ordered.push(remaining.shift()!);
    }

    const orderedItems: CulinaryRouteStop[] = ordered.map((item, index) => ({
      itemId: item.id,
      title: item.title,
      dayIndex: item.dayIndex,
      sortOrder: item.sortOrder,
      lat: item.lat,
      lng: item.lng,
      reason:
        index === 0
          ? 'Bat dau tu diem co thu tu hien tai som nhat de de doi chieu lich trinh.'
          : this.buildHopReason(ordered[index - 1], item, dto.travelMode ?? 'WALKING'),
    }));

    const distances = ordered.slice(1).map((item, index) =>
      this.estimateTravelMinutes(this.getDistanceMeters(ordered[index], item), dto.travelMode ?? 'WALKING'),
    );
    const hasMissingCoords = ordered.some((item) => item.lat === null || item.lng === null);
    const confidenceLabel: AiConfidenceLabel = hasMissingCoords
      ? 'Can xem lai'
      : normalizeVietnamese(dto.travelMode ?? 'WALKING') === 'walking'
        ? 'Goi y'
        : 'Uoc luong';

    return {
      suggestionId: this.buildSuggestionId(tripId, ordered.map((item) => item.id)),
      orderedItems,
      totalEstimatedMinutes: distances.reduce((total, minutes) => total + minutes, 0),
      confidenceLabel,
    };
  }

  async applyCulinaryRoute(
    tripId: string,
    userId: string,
    dto: ApplyCulinaryRouteDto,
  ): Promise<ItinerarySnapshot> {
    await this.requireLeader(tripId, userId);

    if (!dto.sourceSuggestionId.startsWith(`culinary-${tripId}-`)) {
      throw new BadRequestException('Suggestion token does not belong to this trip');
    }

    const uniqueItemIds = Array.from(new Set(dto.orderedItemIds));
    if (uniqueItemIds.length !== dto.orderedItemIds.length) {
      throw new BadRequestException('orderedItemIds must not contain duplicates');
    }

    const selectedItems = await this.prisma.itineraryItem.findMany({
      where: {
        tripId,
        id: { in: uniqueItemIds },
      },
      orderBy: [{ dayIndex: 'asc' }, { sortOrder: 'asc' }],
    });

    if (selectedItems.length !== uniqueItemIds.length) {
      throw new BadRequestException('One or more itinerary items cannot be applied to this trip');
    }

    const itemsById = new Map(selectedItems.map((item) => [item.id, item]));
    const groupedByDay = new Map<number, string[]>();
    for (const itemId of dto.orderedItemIds) {
      const item = itemsById.get(itemId);
      if (!item) {
        throw new BadRequestException('orderedItemIds contains an unknown item');
      }
      const group = groupedByDay.get(item.dayIndex) ?? [];
      group.push(itemId);
      groupedByDay.set(item.dayIndex, group);
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const [dayIndex, orderedIds] of groupedByDay.entries()) {
        const dayItems = await tx.itineraryItem.findMany({
          where: { tripId, dayIndex },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });

        const selectedIdSet = new Set(orderedIds);
        const reorderedTimeline = [
          ...dayItems.filter((item) => !selectedIdSet.has(item.id)),
          ...orderedIds.map((itemId) => {
            const item = dayItems.find((dayItem) => dayItem.id === itemId);
            if (!item) {
              throw new BadRequestException('Route apply payload does not match current day items');
            }
            return item;
          }),
        ];

        for (let i = 0; i < reorderedTimeline.length; i++) {
          await tx.itineraryItem.update({
            where: { id: reorderedTimeline[i].id },
            data: { sortOrder: 10_000 + i },
          });
        }

        for (let i = 0; i < reorderedTimeline.length; i++) {
          await tx.itineraryItem.update({
            where: { id: reorderedTimeline[i].id },
            data: { sortOrder: i + 1 },
          });
        }
      }
    });

    return this.getTripItinerarySnapshot(tripId, userId);
  }

  /**
   * Create a new itinerary item (leader only).
   */
  async createItem(
    tripId: string,
    userId: string,
    dto: CreateItineraryItemDto,
  ) {
    await this.requireLeader(tripId, userId);

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { startDate: true, endDate: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    this.ensureDayIndexInRange(dto.dayIndex, trip.startDate, trip.endDate);

    const startMinute =
      dto.startTime !== undefined ? timeToMinutes(dto.startTime) : null;

    const sortOrder = await this.getNextSortOrder(
      tripId,
      dto.dayIndex,
      startMinute,
      dto.insertAfterItemId,
    );

    await this.prisma.itineraryItem.create({
      data: {
        tripId,
        dayIndex: dto.dayIndex,
        sortOrder,
        startMinute,
        title: dto.title,
        locationName: dto.locationName,
        locationAddress: dto.locationAddress,
        placeId: dto.placeId,
        lat: dto.lat,
        lng: dto.lng,
        shortNote: dto.shortNote,
      },
    });

    if (!dto.insertAfterItemId) {
      await this.normalizeDaySortOrders(tripId, dto.dayIndex);
    }

    return this.getTripItinerarySnapshot(tripId, userId);
  }

  /**
   * Update an existing itinerary item (leader only).
   */
  async updateItem(
    tripId: string,
    userId: string,
    itemId: string,
    dto: UpdateItineraryItemDto,
  ) {
    await this.requireLeader(tripId, userId);

    const existing = await this.prisma.itineraryItem.findFirst({
      where: { id: itemId, tripId },
    });

    if (!existing) {
      throw new NotFoundException('Itinerary item not found');
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { startDate: true, endDate: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const updateData: Record<string, unknown> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.dayIndex !== undefined) {
      this.ensureDayIndexInRange(dto.dayIndex, trip.startDate, trip.endDate);
      updateData.dayIndex = dto.dayIndex;
    }
    if (dto.startTime !== undefined) {
      updateData.startMinute = timeToMinutes(dto.startTime);
    }
    if (dto.locationName !== undefined) updateData.locationName = dto.locationName;
    if (dto.shortNote !== undefined) updateData.shortNote = dto.shortNote;
    if (dto.locationAddress !== undefined) updateData.locationAddress = dto.locationAddress;
    if (dto.placeId !== undefined) updateData.placeId = dto.placeId;
    if (dto.lat !== undefined) updateData.lat = dto.lat;
    if (dto.lng !== undefined) updateData.lng = dto.lng;

    // Increment version on update
    updateData.version = { increment: 1 };

    await this.prisma.itineraryItem.update({
      where: { id: itemId },
      data: updateData,
    });

    if (dto.dayIndex !== undefined && dto.dayIndex !== existing.dayIndex) {
      await this.normalizeDaySortOrders(tripId, existing.dayIndex);
      await this.normalizeDaySortOrders(tripId, dto.dayIndex);
    } else if (dto.startTime !== undefined) {
      await this.normalizeDaySortOrders(tripId, existing.dayIndex);
    }

    return this.getTripItinerarySnapshot(tripId, userId);
  }

  /**
   * Delete an itinerary item (leader only).
   */
  async deleteItem(tripId: string, userId: string, itemId: string) {
    await this.requireLeader(tripId, userId);

    const existing = await this.prisma.itineraryItem.findFirst({
      where: { id: itemId, tripId },
    });

    if (!existing) {
      throw new NotFoundException('Itinerary item not found');
    }

    await this.prisma.itineraryItem.delete({
      where: { id: itemId },
    });

    // Re-normalize sort orders for the day
    const remainingItems = await this.prisma.itineraryItem.findMany({
      where: { tripId, dayIndex: existing.dayIndex },
      orderBy: { sortOrder: 'asc' },
    });

    for (let i = 0; i < remainingItems.length; i++) {
      if (remainingItems[i].sortOrder !== i + 1) {
        await this.prisma.itineraryItem.update({
          where: { id: remainingItems[i].id },
          data: { sortOrder: i + 1 },
        });
      }
    }

    return this.getTripItinerarySnapshot(tripId, userId);
  }

  /**
   * Reorder itinerary items (leader only).
   * Accepts an ordered array of itemId/dayIndex/sortOrder tuples
   * and normalizes sortOrder to 1..N inside a single Prisma transaction.
   */
  async reorderItems(
    tripId: string,
    userId: string,
    dto: ReorderItineraryDto,
  ) {
    await this.requireLeader(tripId, userId);

    // Group items by dayIndex for normalization
    const dayGroups = new Map<number, { itemId: string; sortOrder: number }[]>();

    for (const item of dto.items) {
      if (!dayGroups.has(item.dayIndex)) {
        dayGroups.set(item.dayIndex, []);
      }
      dayGroups.get(item.dayIndex)!.push({
        itemId: item.itemId,
        sortOrder: item.sortOrder,
      });
    }

    // Normalize sortOrder to 1..N per day and execute in a transaction
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const [dayIndex, dayItems] of dayGroups.entries()) {
        // Sort by requested sortOrder
        dayItems.sort((a, b) => a.sortOrder - b.sortOrder);

        // Assign normalized sequential sortOrder 1..N
        for (let i = 0; i < dayItems.length; i++) {
          // First set to a very high temporary value to avoid unique constraint conflicts
          await tx.itineraryItem.update({
            where: { id: dayItems[i].itemId },
            data: { dayIndex, sortOrder: 10000 + i },
          });
        }

        // Then set the actual normalized values
        for (let i = 0; i < dayItems.length; i++) {
          await tx.itineraryItem.update({
            where: { id: dayItems[i].itemId },
            data: { dayIndex, sortOrder: i + 1 },
          });
        }
      }
    });

    return this.getTripItinerarySnapshot(tripId, userId);
  }
}

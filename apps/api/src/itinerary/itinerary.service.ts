import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { ReorderItineraryDto } from './dto/reorder-itinerary.dto';

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
  mapItems: MapItem[];
  totalItems: number;
  isLeader: boolean;
  canEdit: boolean;
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
    const days: DayGroup[] = Array.from(dayMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([dayIndex, dayItems]) => ({ dayIndex, items: dayItems }));

    // Overlap warnings
    const overlapWarnings = this.detectOverlaps(
      items.map((i) => ({
        id: i.id,
        title: i.title,
        dayIndex: i.dayIndex,
        startMinute: i.startMinute,
      })),
    );

    // Map items (only items with lat/lng)
    const mapItems: MapItem[] = items
      .filter((i) => i.lat !== null && i.lng !== null)
      .map((i) => ({
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
      mapItems,
      totalItems: items.length,
      isLeader,
      canEdit: isLeader,
    };
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

    const sortOrder = await this.getNextSortOrder(
      tripId,
      dto.dayIndex,
      dto.insertAfterItemId,
    );

    const startMinute =
      dto.startTime !== undefined ? timeToMinutes(dto.startTime) : null;

    const item = await this.prisma.itineraryItem.create({
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

    const updateData: Record<string, unknown> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.dayIndex !== undefined) updateData.dayIndex = dto.dayIndex;
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
    await this.prisma.$transaction(async (tx) => {
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

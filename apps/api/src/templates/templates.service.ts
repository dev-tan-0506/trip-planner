import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PublishTemplateDto } from './dto/publish-template.dto';
import { CloneTemplateDto } from './dto/clone-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  private generateJoinCode(length = 8): string {
    return randomBytes(length).toString('base64url').slice(0, length).toUpperCase();
  }

  // ─── Publish ───────────────────────────────────────

  async getPublishedTemplateForTrip(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (!member || member.role !== 'LEADER') {
      throw new ForbiddenException('Only the trip leader can view template publish status');
    }

    return this.prisma.communityTemplate.findFirst({
      where: { sourceTripId: tripId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async publishTemplate(tripId: string, userId: string, dto: PublishTemplateDto) {
    // Only leaders can publish
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });
    if (!member || member.role !== 'LEADER') {
      throw new ForbiddenException('Only the trip leader can publish a template');
    }

    const existingTemplate = await this.prisma.communityTemplate.findFirst({
      where: { sourceTripId: tripId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });

    if (existingTemplate) {
      throw new ConflictException('Trip này đã được chia sẻ thành template rồi');
    }

    // Fetch trip + itinerary items
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        itineraryItems: {
          orderBy: [{ dayIndex: 'asc' }, { sortOrder: 'asc' }],
        },
      },
    });
    if (!trip) throw new NotFoundException('Trip not found');

    // Build sanitizedSnapshot — strips personal/member data, votes, proposals, joinCode
    const sanitizedSnapshot = {
      destination: trip.destination,
      days: this.buildSanitizedDays(trip.itineraryItems),
    };

    const daysCount = trip.itineraryItems.length > 0
      ? Math.max(...trip.itineraryItems.map((i) => i.dayIndex)) + 1
      : 0;

    return this.prisma.communityTemplate.create({
      data: {
        sourceTripId: tripId,
        publishedById: userId,
        title: dto.title,
        destinationLabel: trip.destination,
        summary: dto.summary,
        coverNote: dto.coverNote,
        daysCount,
        sanitizedSnapshot: sanitizedSnapshot as any,
        status: 'PUBLISHED',
      },
    });
  }

  private buildSanitizedDays(items: Array<{
    dayIndex: number;
    sortOrder: number;
    title: string;
    startMinute: number | null;
    locationName: string | null;
    lat: number | null;
    lng: number | null;
    shortNote: string | null;
  }>) {
    const dayMap = new Map<number, Array<{
      title: string;
      startMinute: number | null;
      locationName: string | null;
      lat: number | null;
      lng: number | null;
      shortNote: string | null;
      sortOrder: number;
    }>>();

    for (const item of items) {
      const day = dayMap.get(item.dayIndex) || [];
      day.push({
        title: item.title,
        startMinute: item.startMinute,
        locationName: item.locationName,
        lat: item.lat,
        lng: item.lng,
        shortNote: item.shortNote,
        sortOrder: item.sortOrder,
      });
      dayMap.set(item.dayIndex, day);
    }

    // Return as ordered array
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([dayIndex, dayItems]) => ({
        dayIndex,
        items: dayItems.sort((a, b) => a.sortOrder - b.sortOrder),
      }));
  }

  // ─── List / Get Templates ─────────────────────────

  async listTemplates() {
    return this.prisma.communityTemplate.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        destinationLabel: true,
        summary: true,
        daysCount: true,
        cloneCount: true,
        createdAt: true,
        publishedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async getTemplate(templateId: string) {
    const template = await this.prisma.communityTemplate.findUnique({
      where: { id: templateId },
      include: {
        publishedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  // ─── Clone ─────────────────────────────────────────

  async cloneTemplate(templateId: string, userId: string, dto: CloneTemplateDto) {
    const template = await this.prisma.communityTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    const joinCode = this.generateJoinCode();
    const snapshot = template.sanitizedSnapshot as {
      destination: string;
      days: Array<{
        dayIndex: number;
        items: Array<{
          title: string;
          startMinute: number | null;
          locationName: string | null;
          lat: number | null;
          lng: number | null;
          shortNote: string | null;
          sortOrder: number;
        }>;
      }>;
    };

    // Create new trip with caller as LEADER
    const trip = await this.prisma.trip.create({
      data: {
        name: dto.name,
        destination: dto.destination,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        joinCode,
        members: {
          create: {
            userId,
            role: 'LEADER',
          },
        },
      },
    });

    // Deep-copy itinerary items — remap relative days onto new trip dates
    if (snapshot.days && snapshot.days.length > 0) {
      const itemsToCreate = snapshot.days.flatMap((day) =>
        day.items.map((item) => ({
          tripId: trip.id,
          dayIndex: day.dayIndex,
          sortOrder: item.sortOrder,
          title: item.title,
          startMinute: item.startMinute,
          locationName: item.locationName,
          lat: item.lat,
          lng: item.lng,
          shortNote: item.shortNote,
        })),
      );

      await this.prisma.itineraryItem.createMany({ data: itemsToCreate });
    }

    // Increment cloneCount
    await this.prisma.communityTemplate.update({
      where: { id: templateId },
      data: { cloneCount: { increment: 1 } },
    });

    return { tripId: trip.id, joinCode };
  }
}

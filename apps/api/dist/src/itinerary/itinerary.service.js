"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItineraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}
function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}
function computeProgress(startMinute, dayIndex, tripStartDate, tripTimeZone) {
    if (startMinute === null) {
        return 'chua chot gio';
    }
    const now = new Date();
    const itemDate = new Date(tripStartDate);
    itemDate.setDate(itemDate.getDate() + dayIndex);
    const itemDateTime = new Date(itemDate);
    itemDateTime.setHours(Math.floor(startMinute / 60), startMinute % 60, 0, 0);
    const itemEndDateTime = new Date(itemDateTime.getTime() + 60 * 60 * 1000);
    if (now < itemDateTime) {
        return 'sap toi';
    }
    else if (now >= itemDateTime && now < itemEndDateTime) {
        return 'dang di';
    }
    else {
        return 'da di';
    }
}
let ItineraryService = class ItineraryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTripDurationDays(startDate, endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    ensureDayIndexInRange(dayIndex, startDate, endDate) {
        const totalDays = this.getTripDurationDays(startDate, endDate);
        if (dayIndex < 0 || dayIndex >= totalDays) {
            throw new common_1.BadRequestException(`dayIndex must be between 0 and ${Math.max(totalDays - 1, 0)} for this trip`);
        }
    }
    compareItemsForTimeline(a, b) {
        if (a.startMinute !== null && b.startMinute !== null) {
            if (a.startMinute !== b.startMinute) {
                return a.startMinute - b.startMinute;
            }
            return a.sortOrder - b.sortOrder;
        }
        if (a.startMinute !== null)
            return -1;
        if (b.startMinute !== null)
            return 1;
        if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
        }
        if (a.createdAt && b.createdAt) {
            return a.createdAt.getTime() - b.createdAt.getTime();
        }
        return 0;
    }
    async normalizeDaySortOrders(tripId, dayIndex) {
        const items = await this.prisma.itineraryItem.findMany({
            where: { tripId, dayIndex },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        if (items.length <= 1) {
            return;
        }
        const sorted = [...items].sort((a, b) => this.compareItemsForTimeline(a, b));
        await this.prisma.$transaction([
            ...sorted.map((item, index) => this.prisma.itineraryItem.update({
                where: { id: item.id },
                data: { sortOrder: 1000 + index },
            })),
            ...sorted.map((item, index) => this.prisma.itineraryItem.update({
                where: { id: item.id },
                data: { sortOrder: index + 1 },
            })),
        ]);
    }
    async getMemberRole(tripId, userId) {
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
    async requireLeader(tripId, userId) {
        const { isMember, isLeader } = await this.getMemberRole(tripId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You are not a member of this trip');
        }
        if (!isLeader) {
            throw new common_1.ForbiddenException('Only the trip leader can modify the itinerary');
        }
    }
    async getNextSortOrder(tripId, dayIndex, startMinute, insertAfterItemId) {
        if (insertAfterItemId) {
            const afterItem = await this.prisma.itineraryItem.findFirst({
                where: { id: insertAfterItemId, tripId },
            });
            if (afterItem) {
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
        const lastItem = await this.prisma.itineraryItem.findFirst({
            where: { tripId, dayIndex },
            orderBy: { sortOrder: 'desc' },
        });
        return lastItem ? lastItem.sortOrder + 1 : 1;
    }
    detectOverlaps(items) {
        const warnings = [];
        const timedItems = items
            .filter((i) => i.startMinute !== null)
            .sort((a, b) => a.startMinute - b.startMinute);
        for (let i = 0; i < timedItems.length; i++) {
            for (let j = i + 1; j < timedItems.length; j++) {
                const a = timedItems[i];
                const b = timedItems[j];
                if (a.dayIndex !== b.dayIndex)
                    continue;
                const diff = b.startMinute - a.startMinute;
                if (diff < 30) {
                    warnings.push({
                        itemId: b.id,
                        conflictsWith: a.id,
                        dayIndex: a.dayIndex,
                        startMinute: b.startMinute,
                        message: `"${b.title}" (${minutesToTime(b.startMinute)}) overlaps with "${a.title}" (${minutesToTime(a.startMinute)})`,
                    });
                }
            }
        }
        return warnings;
    }
    async getTripItinerarySnapshot(tripId, userId) {
        const { isMember, isLeader } = await this.getMemberRole(tripId, userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You are not a member of this trip');
        }
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
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
        const totalDays = this.getTripDurationDays(trip.startDate, trip.endDate);
        const dayMap = new Map();
        for (const item of items) {
            const progress = computeProgress(item.startMinute, item.dayIndex, trip.startDate, trip.timeZone);
            const enriched = {
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
            dayMap.get(item.dayIndex).push(enriched);
        }
        const days = Array.from({ length: totalDays }, (_, dayIndex) => ({
            dayIndex,
            items: dayMap.get(dayIndex) ?? [],
        }));
        const overlapWarnings = this.detectOverlaps(items.map((i) => ({
            id: i.id,
            title: i.title,
            dayIndex: i.dayIndex,
            startMinute: i.startMinute,
        })));
        const mapItems = items
            .filter((i) => i.lat !== null && i.lng !== null)
            .map((i) => ({
            id: i.id,
            title: i.title,
            lat: i.lat,
            lng: i.lng,
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
    async createItem(tripId, userId, dto) {
        await this.requireLeader(tripId, userId);
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            select: { startDate: true, endDate: true },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        this.ensureDayIndexInRange(dto.dayIndex, trip.startDate, trip.endDate);
        const startMinute = dto.startTime !== undefined ? timeToMinutes(dto.startTime) : null;
        const sortOrder = await this.getNextSortOrder(tripId, dto.dayIndex, startMinute, dto.insertAfterItemId);
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
    async updateItem(tripId, userId, itemId, dto) {
        await this.requireLeader(tripId, userId);
        const existing = await this.prisma.itineraryItem.findFirst({
            where: { id: itemId, tripId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Itinerary item not found');
        }
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            select: { startDate: true, endDate: true },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.dayIndex !== undefined) {
            this.ensureDayIndexInRange(dto.dayIndex, trip.startDate, trip.endDate);
            updateData.dayIndex = dto.dayIndex;
        }
        if (dto.startTime !== undefined) {
            updateData.startMinute = timeToMinutes(dto.startTime);
        }
        if (dto.locationName !== undefined)
            updateData.locationName = dto.locationName;
        if (dto.shortNote !== undefined)
            updateData.shortNote = dto.shortNote;
        if (dto.locationAddress !== undefined)
            updateData.locationAddress = dto.locationAddress;
        if (dto.placeId !== undefined)
            updateData.placeId = dto.placeId;
        if (dto.lat !== undefined)
            updateData.lat = dto.lat;
        if (dto.lng !== undefined)
            updateData.lng = dto.lng;
        updateData.version = { increment: 1 };
        await this.prisma.itineraryItem.update({
            where: { id: itemId },
            data: updateData,
        });
        if (dto.dayIndex !== undefined && dto.dayIndex !== existing.dayIndex) {
            await this.normalizeDaySortOrders(tripId, existing.dayIndex);
            await this.normalizeDaySortOrders(tripId, dto.dayIndex);
        }
        else if (dto.startTime !== undefined) {
            await this.normalizeDaySortOrders(tripId, existing.dayIndex);
        }
        return this.getTripItinerarySnapshot(tripId, userId);
    }
    async deleteItem(tripId, userId, itemId) {
        await this.requireLeader(tripId, userId);
        const existing = await this.prisma.itineraryItem.findFirst({
            where: { id: itemId, tripId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Itinerary item not found');
        }
        await this.prisma.itineraryItem.delete({
            where: { id: itemId },
        });
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
    async reorderItems(tripId, userId, dto) {
        await this.requireLeader(tripId, userId);
        const dayGroups = new Map();
        for (const item of dto.items) {
            if (!dayGroups.has(item.dayIndex)) {
                dayGroups.set(item.dayIndex, []);
            }
            dayGroups.get(item.dayIndex).push({
                itemId: item.itemId,
                sortOrder: item.sortOrder,
            });
        }
        await this.prisma.$transaction(async (tx) => {
            for (const [dayIndex, dayItems] of dayGroups.entries()) {
                dayItems.sort((a, b) => a.sortOrder - b.sortOrder);
                for (let i = 0; i < dayItems.length; i++) {
                    await tx.itineraryItem.update({
                        where: { id: dayItems[i].itemId },
                        data: { dayIndex, sortOrder: 10000 + i },
                    });
                }
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
};
exports.ItineraryService = ItineraryService;
exports.ItineraryService = ItineraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ItineraryService);
//# sourceMappingURL=itinerary.service.js.map
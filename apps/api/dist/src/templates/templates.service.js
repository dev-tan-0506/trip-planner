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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let TemplatesService = class TemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateJoinCode(length = 8) {
        return (0, crypto_1.randomBytes)(length).toString('base64url').slice(0, length).toUpperCase();
    }
    async getPublishedTemplateForTrip(tripId, userId) {
        const member = await this.prisma.tripMember.findUnique({
            where: { userId_tripId: { userId, tripId } },
        });
        if (!member || member.role !== 'LEADER') {
            throw new common_1.ForbiddenException('Only the trip leader can view template publish status');
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
    async publishTemplate(tripId, userId, dto) {
        const member = await this.prisma.tripMember.findUnique({
            where: { userId_tripId: { userId, tripId } },
        });
        if (!member || member.role !== 'LEADER') {
            throw new common_1.ForbiddenException('Only the trip leader can publish a template');
        }
        const existingTemplate = await this.prisma.communityTemplate.findFirst({
            where: { sourceTripId: tripId, status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' },
        });
        if (existingTemplate) {
            throw new common_1.ConflictException('Trip này đã được chia sẻ thành template rồi');
        }
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                itineraryItems: {
                    orderBy: [{ dayIndex: 'asc' }, { sortOrder: 'asc' }],
                },
            },
        });
        if (!trip)
            throw new common_1.NotFoundException('Trip not found');
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
                sanitizedSnapshot: sanitizedSnapshot,
                status: 'PUBLISHED',
            },
        });
    }
    buildSanitizedDays(items) {
        const dayMap = new Map();
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
        return Array.from(dayMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([dayIndex, dayItems]) => ({
            dayIndex,
            items: dayItems.sort((a, b) => a.sortOrder - b.sortOrder),
        }));
    }
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
    async getTemplate(templateId) {
        const template = await this.prisma.communityTemplate.findUnique({
            where: { id: templateId },
            include: {
                publishedBy: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return template;
    }
    async cloneTemplate(templateId, userId, dto) {
        const template = await this.prisma.communityTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        const joinCode = this.generateJoinCode();
        const snapshot = template.sanitizedSnapshot;
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
        if (snapshot.days && snapshot.days.length > 0) {
            const itemsToCreate = snapshot.days.flatMap((day) => day.items.map((item) => ({
                tripId: trip.id,
                dayIndex: day.dayIndex,
                sortOrder: item.sortOrder,
                title: item.title,
                startMinute: item.startMinute,
                locationName: item.locationName,
                lat: item.lat,
                lng: item.lng,
                shortNote: item.shortNote,
            })));
            await this.prisma.itineraryItem.createMany({ data: itemsToCreate });
        }
        await this.prisma.communityTemplate.update({
            where: { id: templateId },
            data: { cloneCount: { increment: 1 } },
        });
        return { tripId: trip.id, joinCode };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map
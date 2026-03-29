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
exports.ProposalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProposalsService = class ProposalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMemberRole(tripId, userId) {
        const member = await this.prisma.tripMember.findUnique({
            where: { userId_tripId: { userId, tripId } },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this trip');
        }
        return {
            role: member.role,
            isLeader: member.role === 'LEADER',
        };
    }
    async requireLeader(tripId, userId) {
        const { isLeader } = await this.getMemberRole(tripId, userId);
        if (!isLeader) {
            throw new common_1.ForbiddenException('Only the trip leader can perform this action');
        }
    }
    async listProposals(tripId, userId) {
        await this.getMemberRole(tripId, userId);
        return this.prisma.itineraryProposal.findMany({
            where: { tripId },
            orderBy: { createdAt: 'desc' },
            include: {
                proposer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                reviewer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                targetItem: {
                    select: { id: true, title: true, dayIndex: true, version: true },
                },
            },
        });
    }
    async createProposal(tripId, userId, dto) {
        await this.getMemberRole(tripId, userId);
        if (dto.type !== 'ADD_ITEM' &&
            (!dto.targetItemId || !dto.baseVersion)) {
            throw new common_1.BadRequestException('targetItemId and baseVersion are required for update proposals');
        }
        if (dto.targetItemId) {
            const targetItem = await this.prisma.itineraryItem.findFirst({
                where: { id: dto.targetItemId, tripId },
            });
            if (!targetItem) {
                throw new common_1.NotFoundException('Target itinerary item not found');
            }
        }
        const proposal = await this.prisma.itineraryProposal.create({
            data: {
                tripId,
                proposerId: userId,
                targetItemId: dto.targetItemId,
                type: dto.type,
                payload: dto.payload,
                baseVersion: dto.baseVersion,
            },
            include: {
                proposer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return proposal;
    }
    async markOutdatedProposals(targetItemId, currentVersion) {
        const result = await this.prisma.itineraryProposal.updateMany({
            where: {
                targetItemId,
                status: 'PENDING',
                NOT: {
                    baseVersion: currentVersion,
                },
            },
            data: {
                status: 'OUTDATED',
            },
        });
        return result.count;
    }
    async acceptProposal(tripId, userId, proposalId) {
        await this.requireLeader(tripId, userId);
        const proposal = await this.prisma.itineraryProposal.findFirst({
            where: { id: proposalId, tripId },
        });
        if (!proposal) {
            throw new common_1.NotFoundException('Proposal not found');
        }
        if (proposal.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot accept a proposal with status "${proposal.status}"`);
        }
        const payload = proposal.payload;
        if (proposal.type === 'ADD_ITEM') {
            const dayIndex = payload.dayIndex || 0;
            const lastItem = await this.prisma.itineraryItem.findFirst({
                where: { tripId, dayIndex },
                orderBy: { sortOrder: 'desc' },
            });
            await this.prisma.itineraryItem.create({
                data: {
                    tripId,
                    dayIndex,
                    sortOrder: lastItem ? lastItem.sortOrder + 1 : 1,
                    title: payload.title || 'Untitled',
                    startMinute: payload.startMinute,
                    locationName: payload.locationName,
                    locationAddress: payload.locationAddress,
                    placeId: payload.placeId,
                    lat: payload.lat,
                    lng: payload.lng,
                    shortNote: payload.shortNote,
                },
            });
        }
        else if (proposal.targetItemId) {
            const updateData = {};
            switch (proposal.type) {
                case 'UPDATE_TIME':
                    if (payload.startMinute !== undefined) {
                        updateData.startMinute = payload.startMinute;
                    }
                    break;
                case 'UPDATE_LOCATION':
                    if (payload.locationName !== undefined) {
                        updateData.locationName = payload.locationName;
                    }
                    if (payload.locationAddress !== undefined) {
                        updateData.locationAddress = payload.locationAddress;
                    }
                    if (payload.lat !== undefined)
                        updateData.lat = payload.lat;
                    if (payload.lng !== undefined)
                        updateData.lng = payload.lng;
                    if (payload.placeId !== undefined)
                        updateData.placeId = payload.placeId;
                    break;
                case 'UPDATE_NOTE':
                    if (payload.shortNote !== undefined) {
                        updateData.shortNote = payload.shortNote;
                    }
                    break;
            }
            updateData.version = { increment: 1 };
            const updatedItem = await this.prisma.itineraryItem.update({
                where: { id: proposal.targetItemId },
                data: updateData,
            });
            await this.markOutdatedProposals(proposal.targetItemId, updatedItem.version);
        }
        const accepted = await this.prisma.itineraryProposal.update({
            where: { id: proposalId },
            data: {
                status: 'ACCEPTED',
                reviewedById: userId,
                reviewedAt: new Date(),
            },
            include: {
                proposer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                reviewer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
        return accepted;
    }
    async rejectProposal(tripId, userId, proposalId) {
        await this.requireLeader(tripId, userId);
        const proposal = await this.prisma.itineraryProposal.findFirst({
            where: { id: proposalId, tripId },
        });
        if (!proposal) {
            throw new common_1.NotFoundException('Proposal not found');
        }
        if (proposal.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Cannot reject a proposal with status "${proposal.status}"`);
        }
        return this.prisma.itineraryProposal.update({
            where: { id: proposalId },
            data: {
                status: 'REJECTED',
                reviewedById: userId,
                reviewedAt: new Date(),
            },
            include: {
                proposer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
                reviewer: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
        });
    }
};
exports.ProposalsService = ProposalsService;
exports.ProposalsService = ProposalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProposalsService);
//# sourceMappingURL=proposals.service.js.map
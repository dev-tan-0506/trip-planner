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
exports.ChecklistsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const checklist_proof_storage_service_1 = require("./checklist-proof-storage.service");
let ChecklistsService = class ChecklistsService {
    constructor(prisma, checklistProofStorageService) {
        this.prisma = prisma;
        this.checklistProofStorageService = checklistProofStorageService;
    }
    async getMembershipOrFail(tripId, userId) {
        const member = await this.prisma.tripMember.findUnique({
            where: { userId_tripId: { userId, tripId } },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this trip');
        }
        return member;
    }
    assertLeader(role) {
        if (role !== 'LEADER') {
            throw new common_1.ForbiddenException('Only leaders can perform this action');
        }
    }
    async getChecklistSnapshot(tripId, userId) {
        const member = await this.getMembershipOrFail(tripId, userId);
        const isLeader = member.role === 'LEADER';
        const groups = await this.prisma.checklistGroup.findMany({
            where: { tripId },
            include: {
                items: {
                    include: {
                        assignee: {
                            include: {
                                user: { select: { id: true, name: true, avatarUrl: true } },
                            },
                        },
                    },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }],
        });
        const sharedCategories = groups
            .filter((g) => g.kind === 'SHARED_CATEGORY')
            .map((g) => this.mapGroup(g, member.id, isLeader));
        const personalTasks = groups
            .filter((g) => g.kind === 'PERSONAL_TASKS')
            .map((g) => this.mapGroup(g, member.id, isLeader));
        const documentGroups = groups
            .filter((g) => g.kind === 'DOCUMENTS')
            .map((g) => this.mapGroup(g, member.id, isLeader));
        const myItems = groups.flatMap((g) => g.items
            .filter((item) => item.assigneeTripMemberId === member.id)
            .map((item) => ({
            itemId: item.id,
            groupId: g.id,
            groupTitle: g.title,
            title: item.title,
            notes: item.notes,
            status: item.status,
            sortOrder: item.sortOrder,
        })));
        return {
            tripId,
            isLeader,
            currentTripMemberId: member.id,
            sharedCategories,
            personalTasks,
            documentGroups,
            myItems,
            totalItems: groups.reduce((sum, g) => sum + g.items.length, 0),
            completedItems: groups.reduce((sum, g) => sum +
                g.items.filter((i) => i.status === 'DONE').length, 0),
        };
    }
    mapGroup(group, currentTripMemberId, isLeader) {
        return {
            id: group.id,
            title: group.title,
            kind: group.kind,
            sortOrder: group.sortOrder,
            itemCount: group.items.length,
            completedCount: group.items.filter((i) => i.status === 'DONE').length,
            items: group.items.map((item) => ({
                id: item.id,
                title: item.title,
                notes: item.notes,
                proofUrl: item.proofUrl,
                proofSubmittedAt: item.proofSubmittedAt?.toISOString() ?? null,
                status: item.status,
                sortOrder: item.sortOrder,
                canToggleSelf: isLeader || item.assigneeTripMemberId === currentTripMemberId,
                assignee: item.assignee
                    ? {
                        tripMemberId: item.assignee.id,
                        userId: item.assignee.user.id,
                        name: item.assignee.user.name,
                        avatarUrl: item.assignee.user.avatarUrl,
                    }
                    : null,
                completedAt: item.completedAt?.toISOString() ?? null,
            })),
        };
    }
    async createGroup(tripId, userId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const maxSort = await this.prisma.checklistGroup.findFirst({
            where: { tripId, kind: dto.kind },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
        });
        await this.prisma.checklistGroup.create({
            data: {
                tripId,
                title: dto.title,
                kind: dto.kind,
                sortOrder: (maxSort?.sortOrder ?? 0) + 1,
            },
        });
        return this.getChecklistSnapshot(tripId, userId);
    }
    async deleteGroup(tripId, userId, groupId) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const group = await this.prisma.checklistGroup.findFirst({
            where: { id: groupId, tripId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        await this.prisma.checklistGroup.delete({ where: { id: groupId } });
        return this.getChecklistSnapshot(tripId, userId);
    }
    async createItem(tripId, userId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const group = await this.prisma.checklistGroup.findFirst({
            where: { id: dto.groupId, tripId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        const maxSort = await this.prisma.checklistItem.findFirst({
            where: { groupId: dto.groupId },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
        });
        if (dto.applyToAllMembers && group.kind === 'DOCUMENTS') {
            const tripMembers = await this.prisma.tripMember.findMany({
                where: { tripId },
                select: { id: true },
                orderBy: { joinedAt: 'asc' },
            });
            let sortOrder = (maxSort?.sortOrder ?? 0) + 1;
            for (const tripMember of tripMembers) {
                await this.prisma.checklistItem.create({
                    data: {
                        tripId,
                        groupId: dto.groupId,
                        title: dto.title,
                        notes: dto.notes,
                        assigneeTripMemberId: tripMember.id,
                        sortOrder,
                    },
                });
                sortOrder += 1;
            }
        }
        else {
            await this.prisma.checklistItem.create({
                data: {
                    tripId,
                    groupId: dto.groupId,
                    title: dto.title,
                    notes: dto.notes,
                    assigneeTripMemberId: dto.assigneeTripMemberId,
                    sortOrder: (maxSort?.sortOrder ?? 0) + 1,
                },
            });
        }
        return this.getChecklistSnapshot(tripId, userId);
    }
    async updateItem(tripId, userId, itemId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const item = await this.prisma.checklistItem.findFirst({
            where: { id: itemId, tripId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found');
        }
        await this.prisma.checklistItem.update({
            where: { id: itemId },
            data: {
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.notes !== undefined && { notes: dto.notes }),
                ...(dto.assigneeTripMemberId !== undefined && {
                    assigneeTripMemberId: dto.assigneeTripMemberId || null,
                }),
            },
        });
        return this.getChecklistSnapshot(tripId, userId);
    }
    async deleteItem(tripId, userId, itemId) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const item = await this.prisma.checklistItem.findFirst({
            where: { id: itemId, tripId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found');
        }
        await this.prisma.checklistItem.delete({ where: { id: itemId } });
        return this.getChecklistSnapshot(tripId, userId);
    }
    async toggleItem(tripId, userId, itemId) {
        const member = await this.getMembershipOrFail(tripId, userId);
        const item = await this.prisma.checklistItem.findFirst({
            where: { id: itemId, tripId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found');
        }
        if (member.role !== 'LEADER' &&
            item.assigneeTripMemberId !== member.id) {
            throw new common_1.ForbiddenException('You can only mark your own assigned items as done');
        }
        const newStatus = item.status === 'DONE' ? 'TODO' : 'DONE';
        await this.prisma.checklistItem.update({
            where: { id: itemId },
            data: {
                status: newStatus,
                completedAt: newStatus === 'DONE' ? new Date() : null,
            },
        });
        return this.getChecklistSnapshot(tripId, userId);
    }
    async submitProof(tripId, userId, itemId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        const item = await this.prisma.checklistItem.findFirst({
            where: { id: itemId, tripId },
            include: { group: true },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found');
        }
        if (item.group.kind !== 'DOCUMENTS') {
            throw new common_1.BadRequestException('Only document items accept proof uploads');
        }
        if (member.role !== 'LEADER' && item.assigneeTripMemberId !== member.id) {
            throw new common_1.ForbiddenException('You can only upload proof for your own document request');
        }
        const proofUrl = await this.checklistProofStorageService.saveProofImage(itemId, member.id, dto.imageDataUrl);
        await this.prisma.checklistItem.update({
            where: { id: itemId },
            data: {
                proofUrl,
                proofSubmittedAt: new Date(),
                status: 'DONE',
                completedAt: new Date(),
            },
        });
        return this.getChecklistSnapshot(tripId, userId);
    }
};
exports.ChecklistsService = ChecklistsService;
exports.ChecklistsService = ChecklistsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        checklist_proof_storage_service_1.ChecklistProofStorageService])
], ChecklistsService);
//# sourceMappingURL=checklists.service.js.map
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
exports.LogisticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LogisticsService = class LogisticsService {
    constructor(prisma) {
        this.prisma = prisma;
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
    async getAllocationSnapshot(tripId, userId) {
        const member = await this.getMembershipOrFail(tripId, userId);
        const isLeader = member.role === 'LEADER';
        const units = await this.prisma.logisticsUnit.findMany({
            where: { tripId },
            include: {
                assignments: {
                    include: {
                        member: {
                            include: {
                                user: { select: { id: true, name: true, avatarUrl: true } },
                            },
                        },
                    },
                },
            },
            orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
        });
        const allMembers = await this.prisma.tripMember.findMany({
            where: { tripId },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
        const roomUnits = units
            .filter((u) => u.type === 'ROOM')
            .map((unit) => this.mapUnitToSnapshot(unit));
        const rideUnits = units
            .filter((u) => u.type === 'RIDE')
            .map((unit) => this.mapUnitToSnapshot(unit));
        return {
            tripId,
            isLeader,
            currentTripMemberId: member.id,
            roomUnits,
            rideUnits,
            totalMembers: allMembers.length,
            members: allMembers.map((m) => ({
                tripMemberId: m.id,
                userId: m.user.id,
                name: m.user.name,
                avatarUrl: m.user.avatarUrl,
                role: m.role,
            })),
        };
    }
    mapUnitToSnapshot(unit) {
        const occupancy = unit.assignments.length;
        const remainingCapacity = Math.max(0, unit.capacity - occupancy);
        const isOverbooked = occupancy > unit.capacity;
        const overCapacityBy = isOverbooked ? occupancy - unit.capacity : 0;
        return {
            id: unit.id,
            type: unit.type,
            label: unit.label,
            capacity: unit.capacity,
            rideKind: unit.rideKind,
            plateNumber: unit.plateNumber,
            seatLabels: unit.seatLabels,
            sortOrder: unit.sortOrder,
            note: unit.note,
            occupancy,
            remainingCapacity,
            isOverbooked,
            overCapacityBy,
            members: unit.assignments.map((a) => ({
                assignmentId: a.id,
                tripMemberId: a.tripMemberId,
                userId: a.member.user.id,
                name: a.member.user.name,
                avatarUrl: a.member.user.avatarUrl,
                seatLabel: a.seatLabel,
                source: a.source,
                role: a.member.role,
            })),
        };
    }
    async createUnit(tripId, userId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const maxSort = await this.prisma.logisticsUnit.findFirst({
            where: { tripId, type: dto.type },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
        });
        const sortOrder = (maxSort?.sortOrder ?? 0) + 1;
        await this.prisma.logisticsUnit.create({
            data: {
                tripId,
                type: dto.type,
                label: dto.label,
                capacity: dto.capacity,
                rideKind: dto.type === 'RIDE' ? dto.rideKind ?? 'CAR' : null,
                plateNumber: dto.type === 'RIDE' ? dto.plateNumber ?? null : null,
                seatLabels: dto.type === 'RIDE' ? dto.seatLabels ?? [] : [],
                sortOrder,
                note: dto.note,
            },
        });
        return this.getAllocationSnapshot(tripId, userId);
    }
    async updateUnit(tripId, userId, unitId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const unit = await this.prisma.logisticsUnit.findFirst({
            where: { id: unitId, tripId },
        });
        if (!unit) {
            throw new common_1.NotFoundException('Unit not found');
        }
        await this.prisma.logisticsUnit.update({
            where: { id: unitId },
            data: {
                ...(dto.label !== undefined && { label: dto.label }),
                ...(dto.capacity !== undefined && { capacity: dto.capacity }),
                ...(dto.rideKind !== undefined && { rideKind: dto.rideKind }),
                ...(dto.plateNumber !== undefined && { plateNumber: dto.plateNumber }),
                ...(dto.seatLabels !== undefined && { seatLabels: dto.seatLabels }),
                ...(dto.note !== undefined && { note: dto.note }),
            },
        });
        return this.getAllocationSnapshot(tripId, userId);
    }
    async deleteUnit(tripId, userId, unitId) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const unit = await this.prisma.logisticsUnit.findFirst({
            where: { id: unitId, tripId },
        });
        if (!unit) {
            throw new common_1.NotFoundException('Unit not found');
        }
        await this.prisma.logisticsUnit.delete({ where: { id: unitId } });
        return this.getAllocationSnapshot(tripId, userId);
    }
    async selfJoin(tripId, userId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        const unit = await this.prisma.logisticsUnit.findFirst({
            where: { id: dto.unitId, tripId },
            include: { assignments: true },
        });
        if (!unit) {
            throw new common_1.NotFoundException('Unit not found');
        }
        const existingAssignment = await this.prisma.allocationAssignment.findFirst({
            where: {
                tripId,
                tripMemberId: member.id,
                unit: { type: unit.type },
            },
        });
        if (existingAssignment) {
            throw new common_1.BadRequestException(`You already have a ${unit.type.toLowerCase()} assignment. Leave your current slot first.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const freshUnit = await tx.logisticsUnit.findUnique({
                where: { id: dto.unitId },
                include: { assignments: true },
            });
            if (!freshUnit) {
                throw new common_1.NotFoundException('Unit not found');
            }
            if (freshUnit.assignments.length >= freshUnit.capacity) {
                throw new common_1.BadRequestException('This slot is full');
            }
            if (freshUnit.type === 'RIDE' && freshUnit.seatLabels.length > 0) {
                if (!dto.seatLabel || !freshUnit.seatLabels.includes(dto.seatLabel)) {
                    throw new common_1.BadRequestException('Please choose a valid seat');
                }
                const takenSeat = freshUnit.assignments.find((assignment) => assignment.seatLabel === dto.seatLabel);
                if (takenSeat) {
                    throw new common_1.BadRequestException('This seat is already taken');
                }
            }
            await tx.allocationAssignment.create({
                data: {
                    tripId,
                    unitId: dto.unitId,
                    tripMemberId: member.id,
                    seatLabel: dto.seatLabel,
                    createdByTripMemberId: member.id,
                    source: 'SELF_JOIN',
                },
            });
            return this.getAllocationSnapshot(tripId, userId);
        });
    }
    async leave(tripId, userId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        const assignment = await this.prisma.allocationAssignment.findFirst({
            where: {
                tripId,
                tripMemberId: member.id,
                unit: { type: dto.type },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException(`You don't have a ${dto.type.toLowerCase()} assignment to leave`);
        }
        await this.prisma.allocationAssignment.delete({
            where: { id: assignment.id },
        });
        return this.getAllocationSnapshot(tripId, userId);
    }
    async reassign(tripId, userId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const targetUnit = await this.prisma.logisticsUnit.findFirst({
            where: { id: dto.targetUnitId, tripId },
        });
        if (!targetUnit) {
            throw new common_1.NotFoundException('Target unit not found');
        }
        const targetMember = await this.prisma.tripMember.findFirst({
            where: { id: dto.tripMemberId, tripId },
        });
        if (!targetMember) {
            throw new common_1.NotFoundException('Member not found in this trip');
        }
        await this.prisma.allocationAssignment.deleteMany({
            where: {
                tripId,
                tripMemberId: dto.tripMemberId,
                unit: { type: targetUnit.type },
            },
        });
        await this.prisma.allocationAssignment.create({
            data: {
                tripId,
                unitId: dto.targetUnitId,
                tripMemberId: dto.tripMemberId,
                seatLabel: dto.targetSeatLabel ?? null,
                createdByTripMemberId: member.id,
                source: 'LEADER',
            },
        });
        return this.getAllocationSnapshot(tripId, userId);
    }
    async autoFill(tripId, userId, type) {
        const member = await this.getMembershipOrFail(tripId, userId);
        this.assertLeader(member.role);
        const allMembers = await this.prisma.tripMember.findMany({
            where: { tripId },
            select: { id: true },
        });
        const existingAssignments = await this.prisma.allocationAssignment.findMany({
            where: {
                tripId,
                unit: { type },
            },
            select: { tripMemberId: true },
        });
        const assignedMemberIds = new Set(existingAssignments.map((a) => a.tripMemberId));
        const unassigned = allMembers.filter((m) => !assignedMemberIds.has(m.id));
        if (unassigned.length === 0) {
            return this.getAllocationSnapshot(tripId, userId);
        }
        const units = await this.prisma.logisticsUnit.findMany({
            where: { tripId, type },
            include: { assignments: true },
            orderBy: { sortOrder: 'asc' },
        });
        const unitsWithCapacity = units
            .map((unit) => ({
            id: unit.id,
            remaining: unit.capacity - unit.assignments.length,
        }))
            .filter((u) => u.remaining > 0);
        let memberIndex = 0;
        const creates = [];
        for (const unit of unitsWithCapacity) {
            for (let i = 0; i < unit.remaining && memberIndex < unassigned.length; i++) {
                creates.push({
                    tripId,
                    unitId: unit.id,
                    tripMemberId: unassigned[memberIndex].id,
                    createdByTripMemberId: member.id,
                    source: 'AUTO_FILL',
                });
                memberIndex++;
            }
        }
        if (creates.length > 0) {
            await this.prisma.allocationAssignment.createMany({ data: creates });
        }
        return this.getAllocationSnapshot(tripId, userId);
    }
};
exports.LogisticsService = LogisticsService;
exports.LogisticsService = LogisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogisticsService);
//# sourceMappingURL=logistics.service.js.map
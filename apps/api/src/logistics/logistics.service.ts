import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogisticsUnitDto } from './dto/create-logistics-unit.dto';
import { ReassignLogisticsMemberDto } from './dto/reassign-logistics-member.dto';
import { SelfJoinLogisticsSlotDto } from './dto/self-join-logistics-slot.dto';
import { LeaveLogisticsSlotDto } from './dto/leave-logistics-slot.dto';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

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

  async getAllocationSnapshot(tripId: string, userId: string) {
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

  private mapUnitToSnapshot(
    unit: {
      id: string;
      type: string;
      label: string;
      capacity: number;
      sortOrder: number;
      note: string | null;
      assignments: Array<{
        id: string;
        tripMemberId: string;
        source: string;
        member: {
          id: string;
          userId: string;
          role: string;
          user: { id: string; name: string | null; avatarUrl: string | null };
        };
      }>;
    },
  ) {
    const occupancy = unit.assignments.length;
    const remainingCapacity = Math.max(0, unit.capacity - occupancy);
    const isOverbooked = occupancy > unit.capacity;
    const overCapacityBy = isOverbooked ? occupancy - unit.capacity : 0;

    return {
      id: unit.id,
      type: unit.type,
      label: unit.label,
      capacity: unit.capacity,
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
        source: a.source,
        role: a.member.role,
      })),
    };
  }

  async createUnit(tripId: string, userId: string, dto: CreateLogisticsUnitDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    // Determine next sortOrder for this type
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
        sortOrder,
        note: dto.note,
      },
    });

    return this.getAllocationSnapshot(tripId, userId);
  }

  async updateUnit(
    tripId: string,
    userId: string,
    unitId: string,
    dto: Partial<CreateLogisticsUnitDto>,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const unit = await this.prisma.logisticsUnit.findFirst({
      where: { id: unitId, tripId },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    // When lowering capacity below current occupancy, keep assignments intact
    // (overbooked state will be visible in the snapshot)
    await this.prisma.logisticsUnit.update({
      where: { id: unitId },
      data: {
        ...(dto.label !== undefined && { label: dto.label }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    });

    return this.getAllocationSnapshot(tripId, userId);
  }

  async deleteUnit(tripId: string, userId: string, unitId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const unit = await this.prisma.logisticsUnit.findFirst({
      where: { id: unitId, tripId },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    await this.prisma.logisticsUnit.delete({ where: { id: unitId } });

    return this.getAllocationSnapshot(tripId, userId);
  }

  async selfJoin(tripId: string, userId: string, dto: SelfJoinLogisticsSlotDto) {
    const member = await this.getMembershipOrFail(tripId, userId);

    const unit = await this.prisma.logisticsUnit.findFirst({
      where: { id: dto.unitId, tripId },
      include: { assignments: true },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    // Check if member already has an assignment in another unit of the same type
    const existingAssignment = await this.prisma.allocationAssignment.findFirst({
      where: {
        tripId,
        tripMemberId: member.id,
        unit: { type: unit.type },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `You already have a ${unit.type.toLowerCase()} assignment. Leave your current slot first.`,
      );
    }

    // Use transaction to prevent overbooking race conditions
    return this.prisma.$transaction(async (tx) => {
      const freshUnit = await tx.logisticsUnit.findUnique({
        where: { id: dto.unitId },
        include: { assignments: true },
      });
      if (!freshUnit) {
        throw new NotFoundException('Unit not found');
      }

      if (freshUnit.assignments.length >= freshUnit.capacity) {
        throw new BadRequestException('This slot is full');
      }

      await tx.allocationAssignment.create({
        data: {
          tripId,
          unitId: dto.unitId,
          tripMemberId: member.id,
          createdByTripMemberId: member.id,
          source: 'SELF_JOIN',
        },
      });

      // Return snapshot from outside transaction
      return this.getAllocationSnapshot(tripId, userId);
    });
  }

  async leave(tripId: string, userId: string, dto: LeaveLogisticsSlotDto) {
    const member = await this.getMembershipOrFail(tripId, userId);

    const assignment = await this.prisma.allocationAssignment.findFirst({
      where: {
        tripId,
        tripMemberId: member.id,
        unit: { type: dto.type },
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `You don't have a ${dto.type.toLowerCase()} assignment to leave`,
      );
    }

    await this.prisma.allocationAssignment.delete({
      where: { id: assignment.id },
    });

    return this.getAllocationSnapshot(tripId, userId);
  }

  async reassign(
    tripId: string,
    userId: string,
    dto: ReassignLogisticsMemberDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const targetUnit = await this.prisma.logisticsUnit.findFirst({
      where: { id: dto.targetUnitId, tripId },
    });
    if (!targetUnit) {
      throw new NotFoundException('Target unit not found');
    }

    // Verify the target member exists in this trip
    const targetMember = await this.prisma.tripMember.findFirst({
      where: { id: dto.tripMemberId, tripId },
    });
    if (!targetMember) {
      throw new NotFoundException('Member not found in this trip');
    }

    // Remove current assignment of same type if any
    await this.prisma.allocationAssignment.deleteMany({
      where: {
        tripId,
        tripMemberId: dto.tripMemberId,
        unit: { type: targetUnit.type },
      },
    });

    // Create new assignment
    await this.prisma.allocationAssignment.create({
      data: {
        tripId,
        unitId: dto.targetUnitId,
        tripMemberId: dto.tripMemberId,
        createdByTripMemberId: member.id,
        source: 'LEADER',
      },
    });

    return this.getAllocationSnapshot(tripId, userId);
  }

  async autoFill(tripId: string, userId: string, type: 'ROOM' | 'RIDE') {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    // Get all members
    const allMembers = await this.prisma.tripMember.findMany({
      where: { tripId },
      select: { id: true },
    });

    // Get currently assigned member IDs for this type
    const existingAssignments = await this.prisma.allocationAssignment.findMany({
      where: {
        tripId,
        unit: { type },
      },
      select: { tripMemberId: true },
    });

    const assignedMemberIds = new Set(
      existingAssignments.map((a) => a.tripMemberId),
    );

    // Find unassigned members
    const unassigned = allMembers.filter((m) => !assignedMemberIds.has(m.id));

    if (unassigned.length === 0) {
      return this.getAllocationSnapshot(tripId, userId);
    }

    // Get units with remaining capacity
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

    // Distribute unassigned members across units with capacity
    let memberIndex = 0;
    const creates: Array<{
      tripId: string;
      unitId: string;
      tripMemberId: string;
      createdByTripMemberId: string;
      source: 'AUTO_FILL';
    }> = [];

    for (const unit of unitsWithCapacity) {
      for (let i = 0; i < unit.remaining && memberIndex < unassigned.length; i++) {
        creates.push({
          tripId,
          unitId: unit.id,
          tripMemberId: unassigned[memberIndex]!.id,
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
}

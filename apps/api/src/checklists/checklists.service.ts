import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { SubmitChecklistProofDto } from './dto/submit-checklist-proof.dto';
import { ChecklistProofStorageService } from './checklist-proof-storage.service';

@Injectable()
export class ChecklistsService {
  constructor(
    private prisma: PrismaService,
    private checklistProofStorageService: ChecklistProofStorageService,
  ) {}

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

  // ─── Snapshot ───────────────────────────────────────

  async getChecklistSnapshot(tripId: string, userId: string) {
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

    // Compute "my items" across all groups
    const myItems = groups.flatMap((g) =>
      g.items
        .filter((item) => item.assigneeTripMemberId === member.id)
        .map((item) => ({
          itemId: item.id,
          groupId: g.id,
          groupTitle: g.title,
          title: item.title,
          notes: item.notes,
          status: item.status,
          sortOrder: item.sortOrder,
        })),
    );

    return {
      tripId,
      isLeader,
      currentTripMemberId: member.id,
      sharedCategories,
      personalTasks,
      documentGroups,
      myItems,
      totalItems: groups.reduce((sum, g) => sum + g.items.length, 0),
      completedItems: groups.reduce(
        (sum, g) => sum + g.items.filter((i) => i.status === 'DONE').length,
        0,
      ),
    };
  }

  private mapGroup(group: {
    id: string;
    title: string;
    kind: string;
    sortOrder: number;
    items: Array<{
      id: string;
      title: string;
      notes: string | null;
      proofUrl: string | null;
      proofSubmittedAt: Date | null;
      status: string;
      sortOrder: number;
      assigneeTripMemberId: string | null;
      completedAt: Date | null;
      assignee: {
        id: string;
        user: { id: string; name: string | null; avatarUrl: string | null };
      } | null;
    }>;
  }, currentTripMemberId: string, isLeader: boolean) {
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

  // ─── Group CRUD (leader only) ──────────────────────

  async createGroup(tripId: string, userId: string, dto: CreateChecklistGroupDto) {
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

  async deleteGroup(tripId: string, userId: string, groupId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const group = await this.prisma.checklistGroup.findFirst({
      where: { id: groupId, tripId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    await this.prisma.checklistGroup.delete({ where: { id: groupId } });
    return this.getChecklistSnapshot(tripId, userId);
  }

  // ─── Item CRUD ─────────────────────────────────────

  async createItem(tripId: string, userId: string, dto: CreateChecklistItemDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const group = await this.prisma.checklistGroup.findFirst({
      where: { id: dto.groupId, tripId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
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
    } else {
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

  async updateItem(
    tripId: string,
    userId: string,
    itemId: string,
    dto: UpdateChecklistItemDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const item = await this.prisma.checklistItem.findFirst({
      where: { id: itemId, tripId },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
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

  async deleteItem(tripId: string, userId: string, itemId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const item = await this.prisma.checklistItem.findFirst({
      where: { id: itemId, tripId },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.prisma.checklistItem.delete({ where: { id: itemId } });
    return this.getChecklistSnapshot(tripId, userId);
  }

  // ─── Toggle Completion ─────────────────────────────

  async toggleItem(tripId: string, userId: string, itemId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);

    const item = await this.prisma.checklistItem.findFirst({
      where: { id: itemId, tripId },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Members can only toggle items assigned to them
    // Leaders can toggle any item
    if (
      member.role !== 'LEADER' &&
      item.assigneeTripMemberId !== member.id
    ) {
      throw new ForbiddenException(
        'You can only mark your own assigned items as done',
      );
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

  async submitProof(
    tripId: string,
    userId: string,
    itemId: string,
    dto: SubmitChecklistProofDto,
  ) {
    const member = await this.getMembershipOrFail(tripId, userId);

    const item = await this.prisma.checklistItem.findFirst({
      where: { id: itemId, tripId },
      include: { group: true },
    });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.group.kind !== 'DOCUMENTS') {
      throw new BadRequestException('Only document items accept proof uploads');
    }

    if (member.role !== 'LEADER' && item.assigneeTripMemberId !== member.id) {
      throw new ForbiddenException('You can only upload proof for your own document request');
    }

    const proofUrl = await this.checklistProofStorageService.saveProofImage(
      itemId,
      member.id,
      dto.imageDataUrl,
    );

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
}

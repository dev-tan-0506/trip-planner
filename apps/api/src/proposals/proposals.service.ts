import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify user is a trip member and return their role.
   */
  private async getMemberRole(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    return {
      role: member.role,
      isLeader: member.role === 'LEADER',
    };
  }

  /**
   * Require leader role for an action.
   */
  private async requireLeader(tripId: string, userId: string): Promise<void> {
    const { isLeader } = await this.getMemberRole(tripId, userId);
    if (!isLeader) {
      throw new ForbiddenException(
        'Only the trip leader can perform this action',
      );
    }
  }

  /**
   * List all proposals for a trip.
   */
  async listProposals(tripId: string, userId: string) {
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

  /**
   * Create a new proposal (any member can propose).
   */
  async createProposal(
    tripId: string,
    userId: string,
    dto: CreateProposalDto,
  ) {
    await this.getMemberRole(tripId, userId);

    // Validate target item exists for update proposals
    if (
      dto.type !== 'ADD_ITEM' &&
      (!dto.targetItemId || !dto.baseVersion)
    ) {
      throw new BadRequestException(
        'targetItemId and baseVersion are required for update proposals',
      );
    }

    if (dto.targetItemId) {
      const targetItem = await this.prisma.itineraryItem.findFirst({
        where: { id: dto.targetItemId, tripId },
      });

      if (!targetItem) {
        throw new NotFoundException('Target itinerary item not found');
      }
    }

    const proposal = await this.prisma.itineraryProposal.create({
      data: {
        tripId,
        proposerId: userId,
        targetItemId: dto.targetItemId,
        type: dto.type,
        payload: dto.payload as any,
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

  /**
   * Mark proposals as OUTDATED when the target item's version has changed.
   */
  async markOutdatedProposals(
    targetItemId: string,
    currentVersion: number,
  ): Promise<number> {
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

  /**
   * Accept a proposal (leader only).
   * Applies the proposal to the itinerary and marks stale sibling proposals.
   */
  async acceptProposal(
    tripId: string,
    userId: string,
    proposalId: string,
  ) {
    await this.requireLeader(tripId, userId);

    const proposal = await this.prisma.itineraryProposal.findFirst({
      where: { id: proposalId, tripId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot accept a proposal with status "${proposal.status}"`,
      );
    }

    const payload = proposal.payload as Record<string, unknown>;

    // Apply the proposal based on type
    if (proposal.type === 'ADD_ITEM') {
      // Create a new itinerary item from the proposal payload
      const dayIndex = (payload.dayIndex as number) || 0;
      const lastItem = await this.prisma.itineraryItem.findFirst({
        where: { tripId, dayIndex },
        orderBy: { sortOrder: 'desc' },
      });

      await this.prisma.itineraryItem.create({
        data: {
          tripId,
          dayIndex,
          sortOrder: lastItem ? lastItem.sortOrder + 1 : 1,
          title: (payload.title as string) || 'Untitled',
          startMinute: payload.startMinute as number | undefined,
          locationName: payload.locationName as string | undefined,
          locationAddress: payload.locationAddress as string | undefined,
          placeId: payload.placeId as string | undefined,
          lat: payload.lat as number | undefined,
          lng: payload.lng as number | undefined,
          shortNote: payload.shortNote as string | undefined,
        },
      });
    } else if (proposal.targetItemId) {
      // Update the target item based on proposal type
      const updateData: Record<string, unknown> = {};

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
          if (payload.lat !== undefined) updateData.lat = payload.lat;
          if (payload.lng !== undefined) updateData.lng = payload.lng;
          if (payload.placeId !== undefined) updateData.placeId = payload.placeId;
          break;
        case 'UPDATE_NOTE':
          if (payload.shortNote !== undefined) {
            updateData.shortNote = payload.shortNote;
          }
          break;
      }

      // Increment version and apply updates
      updateData.version = { increment: 1 };

      const updatedItem = await this.prisma.itineraryItem.update({
        where: { id: proposal.targetItemId },
        data: updateData,
      });

      // Mark outdated proposals for this item
      await this.markOutdatedProposals(
        proposal.targetItemId,
        updatedItem.version,
      );
    }

    // Mark this proposal as accepted
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

  /**
   * Reject a proposal (leader only).
   */
  async rejectProposal(
    tripId: string,
    userId: string,
    proposalId: string,
  ) {
    await this.requireLeader(tripId, userId);

    const proposal = await this.prisma.itineraryProposal.findFirst({
      where: { id: proposalId, tripId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot reject a proposal with status "${proposal.status}"`,
      );
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
}

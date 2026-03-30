import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteSessionDto } from './dto/create-vote-session.dto';
import { SubmitBallotDto } from './dto/submit-ballot.dto';
import { CreateVoteOptionDto } from './dto/create-vote-option.dto';

type SessionOption = {
  id: string;
  title: string;
  payload: unknown;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'WINNER' | 'RUNNER_UP';
};

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  // ─── Membership Guard ─────────────────────────────

  private async getMemberRole(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });
    if (!member) throw new ForbiddenException('You are not a member of this trip');
    return { role: member.role, isLeader: member.role === 'LEADER' };
  }

  private async requireLeader(tripId: string, userId: string) {
    const { isLeader } = await this.getMemberRole(tripId, userId);
    if (!isLeader) throw new ForbiddenException('Only the trip leader can perform this action');
  }

  // ─── Session Lifecycle ────────────────────────────

  async createSession(tripId: string, userId: string, dto: CreateVoteSessionDto) {
    const { isLeader } = await this.getMemberRole(tripId, userId);

    // Validate mode-specific fields
    if (dto.mode === 'NEW_OPTION') {
      if (dto.targetDayIndex === undefined) {
        throw new BadRequestException('targetDayIndex is required for NEW_OPTION sessions');
      }
    }

    if (dto.mode === 'REPLACE_ITEM') {
      if (!dto.targetItemId) {
        throw new BadRequestException('targetItemId is required for REPLACE_ITEM sessions');
      }
      // Verify target item exists
      const item = await this.prisma.itineraryItem.findFirst({
        where: { id: dto.targetItemId, tripId },
      });
      if (!item) throw new NotFoundException('Target itinerary item not found');
    }

    const session = await this.prisma.voteSession.create({
      data: {
        tripId,
        createdById: userId,
        mode: dto.mode,
        status: isLeader ? 'OPEN' : 'PENDING_APPROVAL',
        deadline: new Date(dto.deadline),
        targetItemId: dto.targetItemId,
        targetDayIndex: dto.targetDayIndex,
        targetInsertAfterItemId: dto.targetInsertAfterItemId,
        approvedById: isLeader ? userId : undefined,
      },
      include: this.sessionInclude,
    });

    return session;
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
      include: this.sessionInclude,
    });
    if (!session) throw new NotFoundException('Vote session not found');

    await this.getMemberRole(session.tripId, userId);

    // Auto-close if deadline passed
    if (session.status === 'OPEN' && new Date(session.deadline) < new Date()) {
      return this.closeSession(sessionId, userId);
    }

    return session;
  }

  async approveSession(sessionId: string, userId: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Vote session not found');

    await this.requireLeader(session.tripId, userId);

    if (session.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Session is not pending approval');
    }

    return this.prisma.voteSession.update({
      where: { id: sessionId },
      data: {
        status: 'OPEN',
        approvedById: userId,
      },
      include: this.sessionInclude,
    });
  }

  // ─── Options ──────────────────────────────────────

  async createOption(sessionId: string, userId: string, dto: CreateVoteOptionDto) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Vote session not found');

    await this.getMemberRole(session.tripId, userId);

    const { isLeader } = await this.getMemberRole(session.tripId, userId);

    return this.prisma.voteOption.create({
      data: {
        voteSessionId: sessionId,
        title: dto.title,
        payload: dto.payload as any,
        status: isLeader ? 'ACTIVE' : 'PENDING_APPROVAL',
      },
    });
  }

  async approveOption(sessionId: string, optionId: string, userId: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Vote session not found');

    await this.requireLeader(session.tripId, userId);

    return this.prisma.voteOption.update({
      where: { id: optionId },
      data: { status: 'ACTIVE' },
    });
  }

  // ─── Ballots ──────────────────────────────────────

  async submitBallot(sessionId: string, userId: string, dto: SubmitBallotDto) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
      include: { options: true },
    });
    if (!session) throw new NotFoundException('Vote session not found');

    await this.getMemberRole(session.tripId, userId);

    // Auto-close if deadline passed
    if (new Date(session.deadline) < new Date()) {
      await this.closeSession(sessionId, userId);
      throw new BadRequestException('Voting deadline has passed');
    }

    if (session.status !== 'OPEN') {
      throw new BadRequestException(`Cannot vote in a session with status "${session.status}"`);
    }

    // Verify option is active
    const option = session.options.find(
      (o: SessionOption) => o.id === dto.voteOptionId && o.status === 'ACTIVE',
    );
    if (!option) throw new BadRequestException('Invalid or inactive vote option');

    // Upsert — latest active vote counts (@@unique on [voteSessionId, userId])
    const ballot = await this.prisma.voteBallot.upsert({
      where: { voteSessionId_userId: { voteSessionId: sessionId, userId } },
      update: {
        voteOptionId: dto.voteOptionId,
        updatedAt: new Date(),
      },
      create: {
        voteSessionId: sessionId,
        userId,
        voteOptionId: dto.voteOptionId,
      },
    });

    return ballot;
  }

  // ─── Session Snapshot ─────────────────────────────

  async getSessionSnapshot(sessionId: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
      include: {
        ...this.sessionInclude,
        targetItem: true,
      },
    });
    if (!session) throw new NotFoundException('Vote session not found');

    // Compute vote counts per option
    const ballots = await this.prisma.voteBallot.findMany({
      where: { voteSessionId: sessionId },
    });

    const voteCounts: Record<string, number> = {};
    for (const ballot of ballots) {
      voteCounts[ballot.voteOptionId] = (voteCounts[ballot.voteOptionId] || 0) + 1;
    }

    const optionsWithCounts = session.options.map((opt: SessionOption) => ({
      ...opt,
      voteCount: voteCounts[opt.id] || 0,
    }));

    return {
      ...session,
      options: optionsWithCounts,
      totalVotes: ballots.length,
      currentItem: session.targetItem ?? null,
    };
  }

  // ─── Close + Resolve ──────────────────────────────

  async closeSession(sessionId: string, userId: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
      include: { options: true, ballots: true },
    });
    if (!session) throw new NotFoundException('Vote session not found');

    if (session.status !== 'OPEN') {
      return this.getSessionSnapshot(sessionId);
    }

    // Count votes per ACTIVE option
    const voteCounts: Record<string, number> = {};
    for (const ballot of session.ballots) {
      voteCounts[ballot.voteOptionId] = (voteCounts[ballot.voteOptionId] || 0) + 1;
    }

    const activeOptions = session.options.filter((o: SessionOption) => o.status === 'ACTIVE');
    const maxVotes = Math.max(...activeOptions.map((o: SessionOption) => voteCounts[o.id] || 0), 0);
    const topOptions = activeOptions.filter(
      (o: SessionOption) => (voteCounts[o.id] || 0) === maxVotes,
    );

    // Check for tie
    if (topOptions.length > 1 && maxVotes > 0) {
      if (session.tieBreakRound === 0) {
        // Create tie-break round
        await this.createTieBreakSession(session, topOptions);
        await this.prisma.voteSession.update({
          where: { id: sessionId },
          data: { status: 'CLOSED' },
        });
      } else {
        // Second tie → LEADER_DECISION_REQUIRED
        await this.prisma.voteSession.update({
          where: { id: sessionId },
          data: { status: 'LEADER_DECISION_REQUIRED' },
        });
      }
    } else if (topOptions.length === 1 && maxVotes > 0) {
      // Clear winner
      const winner = topOptions[0]!;

      // Mark winner and runners-up
      await this.prisma.voteOption.update({
        where: { id: winner.id },
        data: { status: 'WINNER' },
      });
      for (const opt of activeOptions.filter((o: SessionOption) => o.id !== winner.id)) {
        await this.prisma.voteOption.update({
          where: { id: opt.id },
          data: { status: 'RUNNER_UP' },
        });
      }

      // Persist VoteSessionOutcome
      await this.persistOutcome(session, winner);

      await this.prisma.voteSession.update({
        where: { id: sessionId },
        data: { status: 'CLOSED' },
      });
    } else {
      // No votes
      await this.prisma.voteSession.update({
        where: { id: sessionId },
        data: { status: 'CLOSED' },
      });
    }

    return this.getSessionSnapshot(sessionId);
  }

  async createTieBreakSession(
    parentSession: {
      id: string;
      tripId: string;
      createdById: string;
      mode: string;
      targetItemId: string | null;
      targetDayIndex: number | null;
      targetInsertAfterItemId: string | null;
      tieBreakRound: number;
    },
    tiedOptions: { id: string; title: string; payload: unknown }[],
  ) {
    // Create shorter tie-break round (half the original deadline time, min 1 hour)
    const tieBreakDeadline = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const tieBreak = await this.prisma.voteSession.create({
      data: {
        tripId: parentSession.tripId,
        createdById: parentSession.createdById,
        mode: 'TIE_BREAK',
        status: 'OPEN',
        deadline: tieBreakDeadline,
        parentSessionId: parentSession.id,
        tieBreakRound: parentSession.tieBreakRound + 1,
        targetItemId: parentSession.targetItemId,
        targetDayIndex: parentSession.targetDayIndex,
        targetInsertAfterItemId: parentSession.targetInsertAfterItemId,
      },
    });

    // Copy tied options into the tie-break session
    for (const opt of tiedOptions) {
      await this.prisma.voteOption.create({
        data: {
          voteSessionId: tieBreak.id,
          title: opt.title,
          payload: opt.payload as any,
          status: 'ACTIVE',
        },
      });
    }

    return tieBreak;
  }

  // ─── Outcome Persistence ──────────────────────────

  private async persistOutcome(
    session: {
      id: string;
      tripId: string;
      mode: string;
      targetItemId: string | null;
      targetDayIndex: number | null;
      targetInsertAfterItemId: string | null;
    },
    winner: { id: string; payload: unknown },
  ) {
    const payload = winner.payload as Record<string, unknown>;

    if (session.mode === 'NEW_OPTION' || session.mode === 'TIE_BREAK') {
      // Auto-insert if possible
      const dayIndex = (session.targetDayIndex as number) ?? 0;
      const lastItem = await this.prisma.itineraryItem.findFirst({
        where: { tripId: session.tripId, dayIndex },
        orderBy: { sortOrder: 'desc' },
      });

      const createdItem = await this.prisma.itineraryItem.create({
        data: {
          tripId: session.tripId,
          dayIndex,
          sortOrder: lastItem ? lastItem.sortOrder + 1 : 1,
          title: (payload.title as string) || 'Vote Winner',
          startMinute: payload.startMinute as number | undefined,
          locationName: payload.locationName as string | undefined,
          lat: payload.lat as number | undefined,
          lng: payload.lng as number | undefined,
        },
      });

      await this.prisma.voteSessionOutcome.create({
        data: {
          voteSessionId: session.id,
          winningOptionId: winner.id,
          tripId: session.tripId,
          targetDayIndex: session.targetDayIndex,
          targetInsertAfterItemId: session.targetInsertAfterItemId,
          payload: winner.payload as any,
          createdItemId: createdItem.id,
        },
      });
    } else if (session.mode === 'REPLACE_ITEM') {
      // Create a reviewable proposal instead of overwriting
      const proposal = await this.prisma.itineraryProposal.create({
        data: {
          tripId: session.tripId,
          proposerId: session.targetItemId ? session.targetItemId : '', // system
          targetItemId: session.targetItemId,
          type: 'UPDATE_LOCATION',
          payload: winner.payload as any,
          status: 'PENDING',
        },
      });

      await this.prisma.voteSessionOutcome.create({
        data: {
          voteSessionId: session.id,
          winningOptionId: winner.id,
          tripId: session.tripId,
          targetItemId: session.targetItemId,
          payload: winner.payload as any,
          replacementProposalId: proposal.id,
        },
      });
    }
  }

  // ─── Leader Decision Resolution ───────────────────

  async resolveLeaderDecision(
    sessionId: string,
    userId: string,
    winningOptionId: string,
  ) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
      include: { options: true },
    });
    if (!session) throw new NotFoundException('Vote session not found');

    await this.requireLeader(session.tripId, userId);

    if (session.status !== 'LEADER_DECISION_REQUIRED') {
      throw new BadRequestException('Session does not require leader decision');
    }

    const winner = session.options.find((o: SessionOption) => o.id === winningOptionId);
    if (!winner) throw new BadRequestException('Invalid option');

    // Mark winner
    await this.prisma.voteOption.update({
      where: { id: winner.id },
      data: { status: 'WINNER' },
    });

    // Persist outcome
    await this.persistOutcome(session, winner);

    return this.prisma.voteSession.update({
      where: { id: sessionId },
      data: { status: 'CLOSED' },
      include: this.sessionInclude,
    });
  }

  // ─── List Sessions ────────────────────────────────

  async listSessions(tripId: string, userId: string) {
    await this.getMemberRole(tripId, userId);

    return this.prisma.voteSession.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      include: this.sessionInclude,
    });
  }

  // ─── Common Include ───────────────────────────────

  private readonly sessionInclude = {
    options: true,
    ballots: {
      select: { id: true, userId: true, voteOptionId: true },
    },
    createdBy: {
      select: { id: true, name: true, avatarUrl: true },
    },
    outcome: true,
  } as const;
}

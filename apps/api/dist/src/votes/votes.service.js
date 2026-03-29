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
exports.VotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VotesService = class VotesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.sessionInclude = {
            options: true,
            ballots: {
                select: { id: true, userId: true, voteOptionId: true },
            },
            createdBy: {
                select: { id: true, name: true, avatarUrl: true },
            },
            outcome: true,
        };
    }
    async getMemberRole(tripId, userId) {
        const member = await this.prisma.tripMember.findUnique({
            where: { userId_tripId: { userId, tripId } },
        });
        if (!member)
            throw new common_1.ForbiddenException('You are not a member of this trip');
        return { role: member.role, isLeader: member.role === 'LEADER' };
    }
    async requireLeader(tripId, userId) {
        const { isLeader } = await this.getMemberRole(tripId, userId);
        if (!isLeader)
            throw new common_1.ForbiddenException('Only the trip leader can perform this action');
    }
    async createSession(tripId, userId, dto) {
        const { isLeader } = await this.getMemberRole(tripId, userId);
        if (dto.mode === 'NEW_OPTION') {
            if (dto.targetDayIndex === undefined) {
                throw new common_1.BadRequestException('targetDayIndex is required for NEW_OPTION sessions');
            }
        }
        if (dto.mode === 'REPLACE_ITEM') {
            if (!dto.targetItemId) {
                throw new common_1.BadRequestException('targetItemId is required for REPLACE_ITEM sessions');
            }
            const item = await this.prisma.itineraryItem.findFirst({
                where: { id: dto.targetItemId, tripId },
            });
            if (!item)
                throw new common_1.NotFoundException('Target itinerary item not found');
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
    async getSession(sessionId, userId) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
            include: this.sessionInclude,
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        await this.getMemberRole(session.tripId, userId);
        if (session.status === 'OPEN' && new Date(session.deadline) < new Date()) {
            return this.closeSession(sessionId, userId);
        }
        return session;
    }
    async approveSession(sessionId, userId) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        await this.requireLeader(session.tripId, userId);
        if (session.status !== 'PENDING_APPROVAL') {
            throw new common_1.BadRequestException('Session is not pending approval');
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
    async createOption(sessionId, userId, dto) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        await this.getMemberRole(session.tripId, userId);
        const { isLeader } = await this.getMemberRole(session.tripId, userId);
        return this.prisma.voteOption.create({
            data: {
                voteSessionId: sessionId,
                title: dto.title,
                payload: dto.payload,
                status: isLeader ? 'ACTIVE' : 'PENDING_APPROVAL',
            },
        });
    }
    async approveOption(sessionId, optionId, userId) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        await this.requireLeader(session.tripId, userId);
        return this.prisma.voteOption.update({
            where: { id: optionId },
            data: { status: 'ACTIVE' },
        });
    }
    async submitBallot(sessionId, userId, dto) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
            include: { options: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        await this.getMemberRole(session.tripId, userId);
        if (new Date(session.deadline) < new Date()) {
            await this.closeSession(sessionId, userId);
            throw new common_1.BadRequestException('Voting deadline has passed');
        }
        if (session.status !== 'OPEN') {
            throw new common_1.BadRequestException(`Cannot vote in a session with status "${session.status}"`);
        }
        const option = session.options.find((o) => o.id === dto.voteOptionId && o.status === 'ACTIVE');
        if (!option)
            throw new common_1.BadRequestException('Invalid or inactive vote option');
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
    async getSessionSnapshot(sessionId) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
            include: {
                ...this.sessionInclude,
                targetItem: true,
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        const ballots = await this.prisma.voteBallot.findMany({
            where: { voteSessionId: sessionId },
        });
        const voteCounts = {};
        for (const ballot of ballots) {
            voteCounts[ballot.voteOptionId] = (voteCounts[ballot.voteOptionId] || 0) + 1;
        }
        const optionsWithCounts = session.options.map((opt) => ({
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
    async closeSession(sessionId, userId) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
            include: { options: true, ballots: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        if (session.status !== 'OPEN') {
            return this.getSessionSnapshot(sessionId);
        }
        const voteCounts = {};
        for (const ballot of session.ballots) {
            voteCounts[ballot.voteOptionId] = (voteCounts[ballot.voteOptionId] || 0) + 1;
        }
        const activeOptions = session.options.filter((o) => o.status === 'ACTIVE');
        const maxVotes = Math.max(...activeOptions.map((o) => voteCounts[o.id] || 0), 0);
        const topOptions = activeOptions.filter((o) => (voteCounts[o.id] || 0) === maxVotes);
        if (topOptions.length > 1 && maxVotes > 0) {
            if (session.tieBreakRound === 0) {
                await this.createTieBreakSession(session, topOptions);
                await this.prisma.voteSession.update({
                    where: { id: sessionId },
                    data: { status: 'CLOSED' },
                });
            }
            else {
                await this.prisma.voteSession.update({
                    where: { id: sessionId },
                    data: { status: 'LEADER_DECISION_REQUIRED' },
                });
            }
        }
        else if (topOptions.length === 1 && maxVotes > 0) {
            const winner = topOptions[0];
            await this.prisma.voteOption.update({
                where: { id: winner.id },
                data: { status: 'WINNER' },
            });
            for (const opt of activeOptions.filter((o) => o.id !== winner.id)) {
                await this.prisma.voteOption.update({
                    where: { id: opt.id },
                    data: { status: 'RUNNER_UP' },
                });
            }
            await this.persistOutcome(session, winner);
            await this.prisma.voteSession.update({
                where: { id: sessionId },
                data: { status: 'CLOSED' },
            });
        }
        else {
            await this.prisma.voteSession.update({
                where: { id: sessionId },
                data: { status: 'CLOSED' },
            });
        }
        return this.getSessionSnapshot(sessionId);
    }
    async createTieBreakSession(parentSession, tiedOptions) {
        const tieBreakDeadline = new Date(Date.now() + 60 * 60 * 1000);
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
        for (const opt of tiedOptions) {
            await this.prisma.voteOption.create({
                data: {
                    voteSessionId: tieBreak.id,
                    title: opt.title,
                    payload: opt.payload,
                    status: 'ACTIVE',
                },
            });
        }
        return tieBreak;
    }
    async persistOutcome(session, winner) {
        const payload = winner.payload;
        if (session.mode === 'NEW_OPTION' || session.mode === 'TIE_BREAK') {
            const dayIndex = session.targetDayIndex ?? 0;
            const lastItem = await this.prisma.itineraryItem.findFirst({
                where: { tripId: session.tripId, dayIndex },
                orderBy: { sortOrder: 'desc' },
            });
            const createdItem = await this.prisma.itineraryItem.create({
                data: {
                    tripId: session.tripId,
                    dayIndex,
                    sortOrder: lastItem ? lastItem.sortOrder + 1 : 1,
                    title: payload.title || 'Vote Winner',
                    startMinute: payload.startMinute,
                    locationName: payload.locationName,
                    lat: payload.lat,
                    lng: payload.lng,
                },
            });
            await this.prisma.voteSessionOutcome.create({
                data: {
                    voteSessionId: session.id,
                    winningOptionId: winner.id,
                    tripId: session.tripId,
                    targetDayIndex: session.targetDayIndex,
                    targetInsertAfterItemId: session.targetInsertAfterItemId,
                    payload: winner.payload,
                    createdItemId: createdItem.id,
                },
            });
        }
        else if (session.mode === 'REPLACE_ITEM') {
            const proposal = await this.prisma.itineraryProposal.create({
                data: {
                    tripId: session.tripId,
                    proposerId: session.targetItemId ? session.targetItemId : '',
                    targetItemId: session.targetItemId,
                    type: 'UPDATE_LOCATION',
                    payload: winner.payload,
                    status: 'PENDING',
                },
            });
            await this.prisma.voteSessionOutcome.create({
                data: {
                    voteSessionId: session.id,
                    winningOptionId: winner.id,
                    tripId: session.tripId,
                    targetItemId: session.targetItemId,
                    payload: winner.payload,
                    replacementProposalId: proposal.id,
                },
            });
        }
    }
    async resolveLeaderDecision(sessionId, userId, winningOptionId) {
        const session = await this.prisma.voteSession.findUnique({
            where: { id: sessionId },
            include: { options: true },
        });
        if (!session)
            throw new common_1.NotFoundException('Vote session not found');
        await this.requireLeader(session.tripId, userId);
        if (session.status !== 'LEADER_DECISION_REQUIRED') {
            throw new common_1.BadRequestException('Session does not require leader decision');
        }
        const winner = session.options.find((o) => o.id === winningOptionId);
        if (!winner)
            throw new common_1.BadRequestException('Invalid option');
        await this.prisma.voteOption.update({
            where: { id: winner.id },
            data: { status: 'WINNER' },
        });
        await this.persistOutcome(session, winner);
        return this.prisma.voteSession.update({
            where: { id: sessionId },
            data: { status: 'CLOSED' },
            include: this.sessionInclude,
        });
    }
    async listSessions(tripId, userId) {
        await this.getMemberRole(tripId, userId);
        return this.prisma.voteSession.findMany({
            where: { tripId },
            orderBy: { createdAt: 'desc' },
            include: this.sessionInclude,
        });
    }
};
exports.VotesService = VotesService;
exports.VotesService = VotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VotesService);
//# sourceMappingURL=votes.service.js.map
import { VotesService } from './votes.service';
import { CreateVoteSessionDto } from './dto/create-vote-session.dto';
import { SubmitBallotDto } from './dto/submit-ballot.dto';
import { CreateVoteOptionDto } from './dto/create-vote-option.dto';
import { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class VotesController {
    private readonly votesService;
    constructor(votesService: VotesService);
    createSession(tripId: string, dto: CreateVoteSessionDto, user: JwtPayload): Promise<{
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        options: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.VoteOptionStatus;
            payload: import("@prisma/client/runtime/library").JsonValue;
            voteSessionId: string;
        }[];
        ballots: {
            id: string;
            userId: string;
            voteOptionId: string;
        }[];
        outcome: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            targetItemId: string | null;
            payload: import("@prisma/client/runtime/library").JsonValue;
            targetDayIndex: number | null;
            targetInsertAfterItemId: string | null;
            voteSessionId: string;
            winningOptionId: string;
            createdItemId: string | null;
            replacementProposalId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.VoteSessionStatus;
        targetItemId: string | null;
        mode: import(".prisma/client").$Enums.VoteSessionMode;
        deadline: Date;
        targetDayIndex: number | null;
        targetInsertAfterItemId: string | null;
        createdById: string;
        parentSessionId: string | null;
        approvedById: string | null;
        tieBreakRound: number;
    }>;
    listSessions(tripId: string, user: JwtPayload): Promise<({
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        options: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.VoteOptionStatus;
            payload: import("@prisma/client/runtime/library").JsonValue;
            voteSessionId: string;
        }[];
        ballots: {
            id: string;
            userId: string;
            voteOptionId: string;
        }[];
        outcome: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            targetItemId: string | null;
            payload: import("@prisma/client/runtime/library").JsonValue;
            targetDayIndex: number | null;
            targetInsertAfterItemId: string | null;
            voteSessionId: string;
            winningOptionId: string;
            createdItemId: string | null;
            replacementProposalId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.VoteSessionStatus;
        targetItemId: string | null;
        mode: import(".prisma/client").$Enums.VoteSessionMode;
        deadline: Date;
        targetDayIndex: number | null;
        targetInsertAfterItemId: string | null;
        createdById: string;
        parentSessionId: string | null;
        approvedById: string | null;
        tieBreakRound: number;
    })[]>;
    getSession(sessionId: string, user: JwtPayload): Promise<{
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        options: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.VoteOptionStatus;
            payload: import("@prisma/client/runtime/library").JsonValue;
            voteSessionId: string;
        }[];
        ballots: {
            id: string;
            userId: string;
            voteOptionId: string;
        }[];
        outcome: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            targetItemId: string | null;
            payload: import("@prisma/client/runtime/library").JsonValue;
            targetDayIndex: number | null;
            targetInsertAfterItemId: string | null;
            voteSessionId: string;
            winningOptionId: string;
            createdItemId: string | null;
            replacementProposalId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.VoteSessionStatus;
        targetItemId: string | null;
        mode: import(".prisma/client").$Enums.VoteSessionMode;
        deadline: Date;
        targetDayIndex: number | null;
        targetInsertAfterItemId: string | null;
        createdById: string;
        parentSessionId: string | null;
        approvedById: string | null;
        tieBreakRound: number;
    }>;
}
export declare class VoteSessionsController {
    private readonly votesService;
    constructor(votesService: VotesService);
    approveSession(sessionId: string, user: JwtPayload): Promise<{
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        options: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.VoteOptionStatus;
            payload: import("@prisma/client/runtime/library").JsonValue;
            voteSessionId: string;
        }[];
        ballots: {
            id: string;
            userId: string;
            voteOptionId: string;
        }[];
        outcome: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            targetItemId: string | null;
            payload: import("@prisma/client/runtime/library").JsonValue;
            targetDayIndex: number | null;
            targetInsertAfterItemId: string | null;
            voteSessionId: string;
            winningOptionId: string;
            createdItemId: string | null;
            replacementProposalId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.VoteSessionStatus;
        targetItemId: string | null;
        mode: import(".prisma/client").$Enums.VoteSessionMode;
        deadline: Date;
        targetDayIndex: number | null;
        targetInsertAfterItemId: string | null;
        createdById: string;
        parentSessionId: string | null;
        approvedById: string | null;
        tieBreakRound: number;
    }>;
    submitBallot(sessionId: string, dto: SubmitBallotDto, user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        voteOptionId: string;
        voteSessionId: string;
    }>;
    createOption(sessionId: string, dto: CreateVoteOptionDto, user: JwtPayload): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.VoteOptionStatus;
        payload: import("@prisma/client/runtime/library").JsonValue;
        voteSessionId: string;
    }>;
    approveOption(sessionId: string, optionId: string, user: JwtPayload): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.VoteOptionStatus;
        payload: import("@prisma/client/runtime/library").JsonValue;
        voteSessionId: string;
    }>;
    resolveLeaderDecision(sessionId: string, body: {
        winningOptionId: string;
    }, user: JwtPayload): Promise<{
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        options: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.VoteOptionStatus;
            payload: import("@prisma/client/runtime/library").JsonValue;
            voteSessionId: string;
        }[];
        ballots: {
            id: string;
            userId: string;
            voteOptionId: string;
        }[];
        outcome: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            targetItemId: string | null;
            payload: import("@prisma/client/runtime/library").JsonValue;
            targetDayIndex: number | null;
            targetInsertAfterItemId: string | null;
            voteSessionId: string;
            winningOptionId: string;
            createdItemId: string | null;
            replacementProposalId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.VoteSessionStatus;
        targetItemId: string | null;
        mode: import(".prisma/client").$Enums.VoteSessionMode;
        deadline: Date;
        targetDayIndex: number | null;
        targetInsertAfterItemId: string | null;
        createdById: string;
        parentSessionId: string | null;
        approvedById: string | null;
        tieBreakRound: number;
    }>;
}

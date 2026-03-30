import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteSessionDto } from './dto/create-vote-session.dto';
import { SubmitBallotDto } from './dto/submit-ballot.dto';
import { CreateVoteOptionDto } from './dto/create-vote-option.dto';
export declare class VotesService {
    private prisma;
    constructor(prisma: PrismaService);
    private getMemberRole;
    private requireLeader;
    createSession(tripId: string, userId: string, dto: CreateVoteSessionDto): Promise<{
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
    getSession(sessionId: string, userId: string): Promise<({
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
    }) | {
        options: {
            voteCount: number;
            id: string;
            title: string;
            payload: unknown;
            status: "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "WINNER" | "RUNNER_UP";
        }[];
        totalVotes: number;
        currentItem: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            dayIndex: number;
            locationName: string | null;
            shortNote: string | null;
            locationAddress: string | null;
            placeId: string | null;
            lat: number | null;
            lng: number | null;
            sortOrder: number;
            startMinute: number | null;
            version: number;
        } | null;
        targetItem: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            dayIndex: number;
            locationName: string | null;
            shortNote: string | null;
            locationAddress: string | null;
            placeId: string | null;
            lat: number | null;
            lng: number | null;
            sortOrder: number;
            startMinute: number | null;
            version: number;
        } | null;
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
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
    approveSession(sessionId: string, userId: string): Promise<{
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
    createOption(sessionId: string, userId: string, dto: CreateVoteOptionDto): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.VoteOptionStatus;
        payload: import("@prisma/client/runtime/library").JsonValue;
        voteSessionId: string;
    }>;
    approveOption(sessionId: string, optionId: string, userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.VoteOptionStatus;
        payload: import("@prisma/client/runtime/library").JsonValue;
        voteSessionId: string;
    }>;
    submitBallot(sessionId: string, userId: string, dto: SubmitBallotDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        voteOptionId: string;
        voteSessionId: string;
    }>;
    getSessionSnapshot(sessionId: string): Promise<{
        options: {
            voteCount: number;
            id: string;
            title: string;
            payload: unknown;
            status: "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "WINNER" | "RUNNER_UP";
        }[];
        totalVotes: number;
        currentItem: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            dayIndex: number;
            locationName: string | null;
            shortNote: string | null;
            locationAddress: string | null;
            placeId: string | null;
            lat: number | null;
            lng: number | null;
            sortOrder: number;
            startMinute: number | null;
            version: number;
        } | null;
        targetItem: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            dayIndex: number;
            locationName: string | null;
            shortNote: string | null;
            locationAddress: string | null;
            placeId: string | null;
            lat: number | null;
            lng: number | null;
            sortOrder: number;
            startMinute: number | null;
            version: number;
        } | null;
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
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
    closeSession(sessionId: string, userId: string): Promise<{
        options: {
            voteCount: number;
            id: string;
            title: string;
            payload: unknown;
            status: "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "WINNER" | "RUNNER_UP";
        }[];
        totalVotes: number;
        currentItem: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            dayIndex: number;
            locationName: string | null;
            shortNote: string | null;
            locationAddress: string | null;
            placeId: string | null;
            lat: number | null;
            lng: number | null;
            sortOrder: number;
            startMinute: number | null;
            version: number;
        } | null;
        targetItem: {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            dayIndex: number;
            locationName: string | null;
            shortNote: string | null;
            locationAddress: string | null;
            placeId: string | null;
            lat: number | null;
            lng: number | null;
            sortOrder: number;
            startMinute: number | null;
            version: number;
        } | null;
        createdBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
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
    createTieBreakSession(parentSession: {
        id: string;
        tripId: string;
        createdById: string;
        mode: string;
        targetItemId: string | null;
        targetDayIndex: number | null;
        targetInsertAfterItemId: string | null;
        tieBreakRound: number;
    }, tiedOptions: {
        id: string;
        title: string;
        payload: unknown;
    }[]): Promise<{
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
    private persistOutcome;
    resolveLeaderDecision(sessionId: string, userId: string, winningOptionId: string): Promise<{
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
    listSessions(tripId: string, userId: string): Promise<({
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
    private readonly sessionInclude;
}

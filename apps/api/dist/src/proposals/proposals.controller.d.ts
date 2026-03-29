import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class ProposalsController {
    private readonly proposalsService;
    constructor(proposalsService: ProposalsService);
    listProposals(tripId: string, user: JwtPayload): Promise<({
        proposer: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        reviewer: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        } | null;
        targetItem: {
            title: string;
            id: string;
            dayIndex: number;
            version: number;
        } | null;
    } & {
        type: import(".prisma/client").$Enums.ItineraryProposalType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.ItineraryProposalStatus;
        targetItemId: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        baseVersion: number | null;
        proposerId: string;
        reviewedById: string | null;
        reviewedAt: Date | null;
    })[]>;
    createProposal(tripId: string, dto: CreateProposalDto, user: JwtPayload): Promise<{
        proposer: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        type: import(".prisma/client").$Enums.ItineraryProposalType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.ItineraryProposalStatus;
        targetItemId: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        baseVersion: number | null;
        proposerId: string;
        reviewedById: string | null;
        reviewedAt: Date | null;
    }>;
    acceptProposal(tripId: string, proposalId: string, user: JwtPayload): Promise<{
        proposer: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        reviewer: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        type: import(".prisma/client").$Enums.ItineraryProposalType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.ItineraryProposalStatus;
        targetItemId: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        baseVersion: number | null;
        proposerId: string;
        reviewedById: string | null;
        reviewedAt: Date | null;
    }>;
    rejectProposal(tripId: string, proposalId: string, user: JwtPayload): Promise<{
        proposer: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
        reviewer: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        type: import(".prisma/client").$Enums.ItineraryProposalType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        status: import(".prisma/client").$Enums.ItineraryProposalStatus;
        targetItemId: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        baseVersion: number | null;
        proposerId: string;
        reviewedById: string | null;
        reviewedAt: Date | null;
    }>;
}

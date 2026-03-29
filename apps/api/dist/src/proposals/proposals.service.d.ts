import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
export declare class ProposalsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getMemberRole;
    private requireLeader;
    listProposals(tripId: string, userId: string): Promise<({
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
    createProposal(tripId: string, userId: string, dto: CreateProposalDto): Promise<{
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
    markOutdatedProposals(targetItemId: string, currentVersion: number): Promise<number>;
    acceptProposal(tripId: string, userId: string, proposalId: string): Promise<{
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
    rejectProposal(tripId: string, userId: string, proposalId: string): Promise<{
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

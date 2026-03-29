import { PrismaService } from '../prisma/prisma.service';
import { PublishTemplateDto } from './dto/publish-template.dto';
import { CloneTemplateDto } from './dto/clone-template.dto';
export declare class TemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateJoinCode;
    getPublishedTemplateForTrip(tripId: string, userId: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        status: string;
    } | null>;
    publishTemplate(tripId: string, userId: string, dto: PublishTemplateDto): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        summary: string | null;
        status: string;
        coverNote: string | null;
        sourceTripId: string;
        publishedById: string;
        destinationLabel: string;
        daysCount: number;
        cloneCount: number;
        sanitizedSnapshot: import("@prisma/client/runtime/library").JsonValue;
    }>;
    private buildSanitizedDays;
    listTemplates(): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        summary: string | null;
        destinationLabel: string;
        daysCount: number;
        cloneCount: number;
        publishedBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
    }[]>;
    getTemplate(templateId: string): Promise<{
        publishedBy: {
            name: string | null;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        summary: string | null;
        status: string;
        coverNote: string | null;
        sourceTripId: string;
        publishedById: string;
        destinationLabel: string;
        daysCount: number;
        cloneCount: number;
        sanitizedSnapshot: import("@prisma/client/runtime/library").JsonValue;
    }>;
    cloneTemplate(templateId: string, userId: string, dto: CloneTemplateDto): Promise<{
        tripId: string;
        joinCode: string;
    }>;
}

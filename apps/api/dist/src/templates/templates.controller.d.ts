import { TemplatesService } from './templates.service';
import { PublishTemplateDto } from './dto/publish-template.dto';
import { CloneTemplateDto } from './dto/clone-template.dto';
import { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class TripTemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    getPublishedTemplate(tripId: string, user: JwtPayload): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        status: string;
    } | null>;
    publish(tripId: string, dto: PublishTemplateDto, user: JwtPayload): Promise<{
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
}
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    list(): Promise<{
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
    get(templateId: string): Promise<{
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
    clone(templateId: string, dto: CloneTemplateDto, user: JwtPayload): Promise<{
        tripId: string;
        joinCode: string;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
export declare class TripsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateJoinCode;
    create(dto: CreateTripDto, leaderUserId: string): Promise<{
        members: {
            id: string;
            role: import(".prisma/client").$Enums.TripRole;
            joinedAt: Date;
            userId: string;
            tripId: string;
        }[];
    } & {
        name: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        id: string;
        joinCode: string;
        timeZone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByJoinCode(joinCode: string): Promise<{
        members: {
            user: {
                id: string;
                name: null;
                avatarUrl: null;
            };
            userId: string;
        }[];
        name: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        id: string;
        joinCode: string;
        timeZone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findPrivateByJoinCode(joinCode: string, userId: string): Promise<{
        members: ({
            user: {
                name: string | null;
                id: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.TripRole;
            joinedAt: Date;
            userId: string;
            tripId: string;
        })[];
    } & {
        name: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        id: string;
        joinCode: string;
        timeZone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    joinTrip(joinCode: string, userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.TripRole;
        joinedAt: Date;
        userId: string;
        tripId: string;
    }>;
}

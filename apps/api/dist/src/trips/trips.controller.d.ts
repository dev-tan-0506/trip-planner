import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class TripsController {
    private readonly tripsService;
    constructor(tripsService: TripsService);
    create(dto: CreateTripDto, user: JwtPayload): Promise<{
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
            id: string;
            role: import(".prisma/client").$Enums.TripRole;
            joinedAt: Date;
            userId: string;
            tripId: string;
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
    findPrivateByJoinCode(joinCode: string, user: JwtPayload): Promise<{
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
    joinTrip(joinCode: string, user: JwtPayload): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.TripRole;
        joinedAt: Date;
        userId: string;
        tripId: string;
    }>;
}

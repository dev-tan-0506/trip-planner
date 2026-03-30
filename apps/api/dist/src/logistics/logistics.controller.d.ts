import { LogisticsService } from './logistics.service';
import { CreateLogisticsUnitDto } from './dto/create-logistics-unit.dto';
import { ReassignLogisticsMemberDto } from './dto/reassign-logistics-member.dto';
import { SelfJoinLogisticsSlotDto } from './dto/self-join-logistics-slot.dto';
import { LeaveLogisticsSlotDto } from './dto/leave-logistics-slot.dto';
import { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class LogisticsController {
    private readonly logisticsService;
    constructor(logisticsService: LogisticsService);
    getAllocations(tripId: string, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
    createUnit(tripId: string, dto: CreateLogisticsUnitDto, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
    updateUnit(tripId: string, unitId: string, dto: Partial<CreateLogisticsUnitDto>, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
    deleteUnit(tripId: string, unitId: string, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
    selfJoin(tripId: string, dto: SelfJoinLogisticsSlotDto, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
    leave(tripId: string, dto: LeaveLogisticsSlotDto, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
    reassign(tripId: string, dto: ReassignLogisticsMemberDto, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
    autoFill(tripId: string, body: {
        type: 'ROOM' | 'RIDE';
    }, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        roomUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        rideUnits: {
            id: string;
            type: string;
            label: string;
            capacity: number;
            rideKind: string | null;
            plateNumber: string | null;
            seatLabels: string[];
            sortOrder: number;
            note: string | null;
            occupancy: number;
            remainingCapacity: number;
            isOverbooked: boolean;
            overCapacityBy: number;
            members: {
                assignmentId: string;
                tripMemberId: string;
                userId: string;
                name: string | null;
                avatarUrl: string | null;
                seatLabel: string | null;
                source: string;
                role: string;
            }[];
        }[];
        totalMembers: number;
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
        }[];
    }>;
}

import { JwtPayload } from '../auth/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { CreateAttendanceSubmissionDto } from './dto/create-attendance-submission.dto';
import { AttendanceGateway } from './attendance.gateway';
export declare class AttendanceController {
    private readonly attendanceService;
    private readonly attendanceGateway;
    constructor(attendanceService: AttendanceService, attendanceGateway: AttendanceGateway);
    getCurrentSession(tripId: string, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        session: {
            id: string;
            tripId: string;
            title: string;
            meetingLabel: string;
            meetingAddress: string;
            lat: number | null;
            lng: number | null;
            opensAt: string;
            closesAt: string;
            status: import(".prisma/client").$Enums.AttendanceSessionStatus;
        } | null;
        counts: {
            arrived: number;
            missing: number;
            noLocation: number;
        };
        mapPoints: {
            tripMemberId: string;
            name: string | null;
            lat: number;
            lng: number;
            status: string;
        }[];
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
            hasSubmitted: boolean;
            submittedAt: string | null;
            status: "ARRIVED" | "MISSING" | "NO_LOCATION";
            photoUrl: string | null;
            lat: number | null;
            lng: number | null;
            accuracyMeters: number | null;
            locationStatus: ("GRANTED" | "DENIED" | "UNAVAILABLE") | null;
        }[];
    }>;
    createSession(tripId: string, dto: CreateAttendanceSessionDto, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        session: {
            id: string;
            tripId: string;
            title: string;
            meetingLabel: string;
            meetingAddress: string;
            lat: number | null;
            lng: number | null;
            opensAt: string;
            closesAt: string;
            status: import(".prisma/client").$Enums.AttendanceSessionStatus;
        } | null;
        counts: {
            arrived: number;
            missing: number;
            noLocation: number;
        };
        mapPoints: {
            tripMemberId: string;
            name: string | null;
            lat: number;
            lng: number;
            status: string;
        }[];
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
            hasSubmitted: boolean;
            submittedAt: string | null;
            status: "ARRIVED" | "MISSING" | "NO_LOCATION";
            photoUrl: string | null;
            lat: number | null;
            lng: number | null;
            accuracyMeters: number | null;
            locationStatus: ("GRANTED" | "DENIED" | "UNAVAILABLE") | null;
        }[];
    }>;
    submitProof(sessionId: string, dto: CreateAttendanceSubmissionDto, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        session: {
            id: string;
            tripId: string;
            title: string;
            meetingLabel: string;
            meetingAddress: string;
            lat: number | null;
            lng: number | null;
            opensAt: string;
            closesAt: string;
            status: import(".prisma/client").$Enums.AttendanceSessionStatus;
        } | null;
        counts: {
            arrived: number;
            missing: number;
            noLocation: number;
        };
        mapPoints: {
            tripMemberId: string;
            name: string | null;
            lat: number;
            lng: number;
            status: string;
        }[];
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
            hasSubmitted: boolean;
            submittedAt: string | null;
            status: "ARRIVED" | "MISSING" | "NO_LOCATION";
            photoUrl: string | null;
            lat: number | null;
            lng: number | null;
            accuracyMeters: number | null;
            locationStatus: ("GRANTED" | "DENIED" | "UNAVAILABLE") | null;
        }[];
    }>;
    closeSession(sessionId: string, user: JwtPayload): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        session: {
            id: string;
            tripId: string;
            title: string;
            meetingLabel: string;
            meetingAddress: string;
            lat: number | null;
            lng: number | null;
            opensAt: string;
            closesAt: string;
            status: import(".prisma/client").$Enums.AttendanceSessionStatus;
        } | null;
        counts: {
            arrived: number;
            missing: number;
            noLocation: number;
        };
        mapPoints: {
            tripMemberId: string;
            name: string | null;
            lat: number;
            lng: number;
            status: string;
        }[];
        members: {
            tripMemberId: string;
            userId: string;
            name: string | null;
            avatarUrl: string | null;
            role: string;
            hasSubmitted: boolean;
            submittedAt: string | null;
            status: "ARRIVED" | "MISSING" | "NO_LOCATION";
            photoUrl: string | null;
            lat: number | null;
            lng: number | null;
            accuracyMeters: number | null;
            locationStatus: ("GRANTED" | "DENIED" | "UNAVAILABLE") | null;
        }[];
    }>;
}

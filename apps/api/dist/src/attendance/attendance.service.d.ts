import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { CreateAttendanceSubmissionDto } from './dto/create-attendance-submission.dto';
import { ProofStorageService } from './proof-storage.service';
type AttendanceLocationStatusValue = 'GRANTED' | 'DENIED' | 'UNAVAILABLE';
type AttendanceRow = {
    tripMemberId: string;
    userId: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
    hasSubmitted: boolean;
    submittedAt: string | null;
    status: 'ARRIVED' | 'MISSING' | 'NO_LOCATION';
    photoUrl: string | null;
    lat: number | null;
    lng: number | null;
    accuracyMeters: number | null;
    locationStatus: AttendanceLocationStatusValue | null;
};
export declare class AttendanceService {
    private readonly prisma;
    private readonly proofStorageService;
    constructor(prisma: PrismaService, proofStorageService: ProofStorageService);
    private getMembershipOrFail;
    private getLatestSession;
    getCurrentAttendanceSnapshot(tripId: string, userId: string): Promise<{
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
        members: AttendanceRow[];
    }>;
    createSession(tripId: string, userId: string, dto: CreateAttendanceSessionDto): Promise<{
        sessionId: string;
        snapshot: {
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
            members: AttendanceRow[];
        };
    }>;
    submitProof(sessionId: string, userId: string, dto: CreateAttendanceSubmissionDto): Promise<{
        tripId: string;
        sessionId: string;
        snapshot: {
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
            members: AttendanceRow[];
        };
    }>;
    closeSession(sessionId: string, userId: string): Promise<{
        tripId: string;
        sessionId: string;
        snapshot: {
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
            members: AttendanceRow[];
        };
    }>;
}
export {};

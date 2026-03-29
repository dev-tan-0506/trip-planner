"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const proof_storage_service_1 = require("./proof-storage.service");
let AttendanceService = class AttendanceService {
    constructor(prisma, proofStorageService) {
        this.prisma = prisma;
        this.proofStorageService = proofStorageService;
    }
    async getMembershipOrFail(tripId, userId) {
        const member = await this.prisma.tripMember.findUnique({
            where: { userId_tripId: { userId, tripId } },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this trip');
        }
        return member;
    }
    async getLatestSession(tripId) {
        return this.prisma.attendanceSession.findFirst({
            where: { tripId },
            include: {
                submissions: {
                    include: {
                        member: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCurrentAttendanceSnapshot(tripId, userId) {
        const member = await this.getMembershipOrFail(tripId, userId);
        const [members, session] = await Promise.all([
            this.prisma.tripMember.findMany({
                where: { tripId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
            }),
            this.getLatestSession(tripId),
        ]);
        const submissionsByMemberId = new Map((session?.submissions ?? []).map((submission) => [submission.tripMemberId, submission]));
        const rows = members.map((tripMember) => {
            const submission = submissionsByMemberId.get(tripMember.id);
            const hasLocation = submission?.locationStatus === client_1.AttendanceLocationStatus.GRANTED &&
                submission.lat != null &&
                submission.lng != null;
            const status = !submission
                ? 'MISSING'
                : hasLocation
                    ? 'ARRIVED'
                    : 'NO_LOCATION';
            return {
                tripMemberId: tripMember.id,
                userId: tripMember.user.id,
                name: tripMember.user.name,
                avatarUrl: tripMember.user.avatarUrl,
                role: tripMember.role,
                hasSubmitted: !!submission,
                submittedAt: submission?.submittedAt.toISOString() ?? null,
                status,
                photoUrl: submission?.photoUrl ?? null,
                lat: submission?.lat ?? null,
                lng: submission?.lng ?? null,
                accuracyMeters: submission?.accuracyMeters ?? null,
                locationStatus: submission?.locationStatus ?? null,
            };
        });
        const orderedRows = [...rows].sort((left, right) => {
            const priority = { MISSING: 0, NO_LOCATION: 1, ARRIVED: 2 };
            return (priority[left.status] -
                priority[right.status] ||
                (left.name ?? '').localeCompare(right.name ?? ''));
        });
        return {
            tripId,
            isLeader: member.role === 'LEADER',
            currentTripMemberId: member.id,
            session: session
                ? {
                    id: session.id,
                    tripId: session.tripId,
                    title: session.title,
                    meetingLabel: session.meetingLabel,
                    meetingAddress: session.meetingAddress,
                    lat: session.lat,
                    lng: session.lng,
                    opensAt: session.opensAt.toISOString(),
                    closesAt: session.closesAt.toISOString(),
                    status: session.status,
                }
                : null,
            counts: {
                arrived: rows.filter((row) => row.status === 'ARRIVED').length,
                missing: rows.filter((row) => row.status === 'MISSING').length,
                noLocation: rows.filter((row) => row.status === 'NO_LOCATION').length,
            },
            mapPoints: rows
                .filter((row) => row.lat != null && row.lng != null)
                .map((row) => ({
                tripMemberId: row.tripMemberId,
                name: row.name,
                lat: row.lat,
                lng: row.lng,
                status: row.status === 'ARRIVED' ? 'ARRIVED' : 'NO_LOCATION',
            })),
            members: orderedRows,
        };
    }
    async createSession(tripId, userId, dto) {
        const member = await this.getMembershipOrFail(tripId, userId);
        if (member.role !== 'LEADER') {
            throw new common_1.ForbiddenException('Only leaders can open check-in');
        }
        const opensAt = new Date(dto.opensAt);
        const closesAt = new Date(dto.closesAt);
        if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime()) || closesAt <= opensAt) {
            throw new common_1.BadRequestException('Invalid check-in window');
        }
        await this.prisma.attendanceSession.updateMany({
            where: { tripId, status: client_1.AttendanceSessionStatus.OPEN },
            data: { status: client_1.AttendanceSessionStatus.CLOSED },
        });
        const session = await this.prisma.attendanceSession.create({
            data: {
                tripId,
                createdByTripMemberId: member.id,
                title: dto.title,
                meetingLabel: dto.meetingLabel,
                meetingAddress: dto.meetingAddress,
                lat: dto.lat,
                lng: dto.lng,
                opensAt,
                closesAt,
            },
        });
        return {
            sessionId: session.id,
            snapshot: await this.getCurrentAttendanceSnapshot(tripId, userId),
        };
    }
    async submitProof(sessionId, userId, dto) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Attendance session not found');
        }
        const member = await this.getMembershipOrFail(session.tripId, userId);
        const now = new Date();
        if (session.status !== client_1.AttendanceSessionStatus.OPEN || now > session.closesAt) {
            throw new common_1.BadRequestException('This check-in session is already closed');
        }
        const photoUrl = dto.imageDataUrl
            ? await this.proofStorageService.saveProofImage(sessionId, member.id, dto.imageDataUrl)
            : null;
        await this.prisma.attendanceSubmission.upsert({
            where: {
                sessionId_tripMemberId: {
                    sessionId,
                    tripMemberId: member.id,
                },
            },
            create: {
                sessionId,
                tripMemberId: member.id,
                photoUrl,
                lat: dto.locationStatus === client_1.AttendanceLocationStatus.GRANTED ? dto.lat : null,
                lng: dto.locationStatus === client_1.AttendanceLocationStatus.GRANTED ? dto.lng : null,
                accuracyMeters: dto.locationStatus === client_1.AttendanceLocationStatus.GRANTED ? dto.accuracyMeters : null,
                locationStatus: dto.locationStatus,
            },
            update: {
                photoUrl,
                submittedAt: now,
                lat: dto.locationStatus === client_1.AttendanceLocationStatus.GRANTED ? dto.lat : null,
                lng: dto.locationStatus === client_1.AttendanceLocationStatus.GRANTED ? dto.lng : null,
                accuracyMeters: dto.locationStatus === client_1.AttendanceLocationStatus.GRANTED ? dto.accuracyMeters : null,
                locationStatus: dto.locationStatus,
            },
        });
        return {
            tripId: session.tripId,
            sessionId,
            snapshot: await this.getCurrentAttendanceSnapshot(session.tripId, userId),
        };
    }
    async closeSession(sessionId, userId) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Attendance session not found');
        }
        const member = await this.getMembershipOrFail(session.tripId, userId);
        if (member.role !== 'LEADER') {
            throw new common_1.ForbiddenException('Only leaders can close check-in');
        }
        await this.prisma.attendanceSession.update({
            where: { id: sessionId },
            data: {
                status: client_1.AttendanceSessionStatus.CLOSED,
            },
        });
        return {
            tripId: session.tripId,
            sessionId,
            snapshot: await this.getCurrentAttendanceSnapshot(session.tripId, userId),
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        proof_storage_service_1.ProofStorageService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map
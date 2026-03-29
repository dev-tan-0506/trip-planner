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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let TripsService = class TripsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateJoinCode(length = 8) {
        return (0, crypto_1.randomBytes)(length)
            .toString('base64url')
            .slice(0, length)
            .toUpperCase();
    }
    async create(dto, leaderUserId) {
        const joinCode = this.generateJoinCode();
        const trip = await this.prisma.trip.create({
            data: {
                name: dto.name,
                destination: dto.destination,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                joinCode,
                members: {
                    create: {
                        userId: leaderUserId,
                        role: 'LEADER',
                    },
                },
            },
            include: { members: true },
        });
        return trip;
    }
    async findByJoinCode(joinCode) {
        const trip = await this.prisma.trip.findUnique({
            where: { joinCode },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                },
            },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        return {
            ...trip,
            members: trip.members.map((member) => ({
                ...member,
                user: {
                    id: member.user.id,
                    name: null,
                    avatarUrl: null,
                },
            })),
        };
    }
    async findPrivateByJoinCode(joinCode, userId) {
        const trip = await this.prisma.trip.findUnique({
            where: { joinCode },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                },
            },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        const isMember = trip.members.some((member) => member.userId === userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You must join this trip to view private member details');
        }
        return trip;
    }
    async joinTrip(joinCode, userId) {
        const trip = await this.findByJoinCode(joinCode);
        const existingMember = await this.prisma.tripMember.findUnique({
            where: { userId_tripId: { userId, tripId: trip.id } },
        });
        if (existingMember) {
            return existingMember;
        }
        return this.prisma.tripMember.create({
            data: {
                userId,
                tripId: trip.id,
                role: 'MEMBER',
            },
        });
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
//# sourceMappingURL=trips.service.js.map
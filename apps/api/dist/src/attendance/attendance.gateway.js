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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AttendanceGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const attendance_service_1 = require("./attendance.service");
let AttendanceGateway = AttendanceGateway_1 = class AttendanceGateway {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
        this.logger = new common_1.Logger(AttendanceGateway_1.name);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleJoin(data, client) {
        const tripRoom = `attendance-trip:${data.tripId}`;
        await client.join(tripRoom);
        if (data.sessionId) {
            await client.join(`attendance-session:${data.sessionId}`);
        }
        try {
            const snapshot = await this.attendanceService.getCurrentAttendanceSnapshot(data.tripId, data.userId);
            client.emit('attendance.snapshot', snapshot);
        }
        catch {
            client.emit('attendance.error', { message: 'Attendance snapshot unavailable' });
        }
    }
    async handleLeave(data, client) {
        await client.leave(`attendance-trip:${data.tripId}`);
        if (data.sessionId) {
            await client.leave(`attendance-session:${data.sessionId}`);
        }
    }
    async broadcastAttendanceUpdated(tripId, sessionId) {
        this.server.to(`attendance-trip:${tripId}`).emit('attendance.updated', {
            tripId,
            sessionId: sessionId ?? null,
        });
        if (sessionId) {
            this.server.to(`attendance-session:${sessionId}`).emit('attendance.updated', {
                tripId,
                sessionId,
            });
        }
    }
};
exports.AttendanceGateway = AttendanceGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AttendanceGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('attendance.join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AttendanceGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('attendance.leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AttendanceGateway.prototype, "handleLeave", null);
exports.AttendanceGateway = AttendanceGateway = AttendanceGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/attendance',
    }),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceGateway);
//# sourceMappingURL=attendance.gateway.js.map
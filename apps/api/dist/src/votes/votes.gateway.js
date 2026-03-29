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
var VotesGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const votes_service_1 = require("./votes.service");
const common_1 = require("@nestjs/common");
let VotesGateway = VotesGateway_1 = class VotesGateway {
    constructor(votesService) {
        this.votesService = votesService;
        this.logger = new common_1.Logger(VotesGateway_1.name);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinRoom(data, client) {
        const room = `vote-session:${data.sessionId}`;
        await client.join(room);
        try {
            const snapshot = await this.votesService.getSessionSnapshot(data.sessionId);
            client.emit('vote.snapshot', snapshot);
        }
        catch (err) {
            client.emit('vote.error', { message: 'Session not found' });
        }
    }
    async handleLeaveRoom(data, client) {
        const room = `vote-session:${data.sessionId}`;
        await client.leave(room);
    }
    async broadcastSessionUpdated(sessionId) {
        const room = `vote-session:${sessionId}`;
        try {
            const snapshot = await this.votesService.getSessionSnapshot(sessionId);
            this.server.to(room).emit('vote.session-updated', snapshot);
        }
        catch {
        }
    }
    async broadcastResultsUpdated(sessionId) {
        const room = `vote-session:${sessionId}`;
        try {
            const snapshot = await this.votesService.getSessionSnapshot(sessionId);
            this.server.to(room).emit('vote.results-updated', snapshot);
        }
        catch {
        }
    }
    async broadcastSessionClosed(sessionId) {
        const room = `vote-session:${sessionId}`;
        try {
            const snapshot = await this.votesService.getSessionSnapshot(sessionId);
            this.server.to(room).emit('vote.closed', snapshot);
        }
        catch {
        }
    }
};
exports.VotesGateway = VotesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], VotesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('vote.join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], VotesGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('vote.leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], VotesGateway.prototype, "handleLeaveRoom", null);
exports.VotesGateway = VotesGateway = VotesGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/votes',
    }),
    __metadata("design:paramtypes", [votes_service_1.VotesService])
], VotesGateway);
//# sourceMappingURL=votes.gateway.js.map
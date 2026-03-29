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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteSessionsController = exports.VotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const votes_service_1 = require("./votes.service");
const create_vote_session_dto_1 = require("./dto/create-vote-session.dto");
const submit_ballot_dto_1 = require("./dto/submit-ballot.dto");
const create_vote_option_dto_1 = require("./dto/create-vote-option.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let VotesController = class VotesController {
    constructor(votesService) {
        this.votesService = votesService;
    }
    async createSession(tripId, dto, user) {
        return this.votesService.createSession(tripId, user.sub, dto);
    }
    async listSessions(tripId, user) {
        return this.votesService.listSessions(tripId, user.sub);
    }
    async getSession(sessionId, user) {
        return this.votesService.getSession(sessionId, user.sub);
    }
};
exports.VotesController = VotesController;
__decorate([
    (0, common_1.Post)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new vote session' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_vote_session_dto_1.CreateVoteSessionDto, Object]),
    __metadata("design:returntype", Promise)
], VotesController.prototype, "createSession", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'List all vote sessions for a trip' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VotesController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single vote session with snapshot' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VotesController.prototype, "getSession", null);
exports.VotesController = VotesController = __decorate([
    (0, common_1.Controller)('trips/:tripId/votes'),
    (0, swagger_1.ApiTags)('Vote Sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [votes_service_1.VotesService])
], VotesController);
let VoteSessionsController = class VoteSessionsController {
    constructor(votesService) {
        this.votesService = votesService;
    }
    async approveSession(sessionId, user) {
        return this.votesService.approveSession(sessionId, user.sub);
    }
    async submitBallot(sessionId, dto, user) {
        return this.votesService.submitBallot(sessionId, user.sub, dto);
    }
    async createOption(sessionId, dto, user) {
        return this.votesService.createOption(sessionId, user.sub, dto);
    }
    async approveOption(sessionId, optionId, user) {
        return this.votesService.approveOption(sessionId, optionId, user.sub);
    }
    async resolveLeaderDecision(sessionId, body, user) {
        return this.votesService.resolveLeaderDecision(sessionId, user.sub, body.winningOptionId);
    }
};
exports.VoteSessionsController = VoteSessionsController;
__decorate([
    (0, common_1.Post)(':sessionId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Leader approves a pending session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VoteSessionsController.prototype, "approveSession", null);
__decorate([
    (0, common_1.Post)(':sessionId/ballot'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit or update a ballot' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_ballot_dto_1.SubmitBallotDto, Object]),
    __metadata("design:returntype", Promise)
], VoteSessionsController.prototype, "submitBallot", null);
__decorate([
    (0, common_1.Post)(':sessionId/options'),
    (0, swagger_1.ApiOperation)({ summary: 'Add an option to a session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_vote_option_dto_1.CreateVoteOptionDto, Object]),
    __metadata("design:returntype", Promise)
], VoteSessionsController.prototype, "createOption", null);
__decorate([
    (0, common_1.Post)(':sessionId/options/:optionId/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Leader approves a pending option' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Param)('optionId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VoteSessionsController.prototype, "approveOption", null);
__decorate([
    (0, common_1.Post)(':sessionId/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Leader resolves a tie-break decision' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VoteSessionsController.prototype, "resolveLeaderDecision", null);
exports.VoteSessionsController = VoteSessionsController = __decorate([
    (0, common_1.Controller)('vote-sessions'),
    (0, swagger_1.ApiTags)('Vote Sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [votes_service_1.VotesService])
], VoteSessionsController);
//# sourceMappingURL=votes.controller.js.map
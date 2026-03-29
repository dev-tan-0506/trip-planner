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
exports.ProposalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const proposals_service_1 = require("./proposals.service");
const create_proposal_dto_1 = require("./dto/create-proposal.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ProposalsController = class ProposalsController {
    constructor(proposalsService) {
        this.proposalsService = proposalsService;
    }
    async listProposals(tripId, user) {
        return this.proposalsService.listProposals(tripId, user.sub);
    }
    async createProposal(tripId, dto, user) {
        return this.proposalsService.createProposal(tripId, user.sub, dto);
    }
    async acceptProposal(tripId, proposalId, user) {
        return this.proposalsService.acceptProposal(tripId, user.sub, proposalId);
    }
    async rejectProposal(tripId, proposalId, user) {
        return this.proposalsService.rejectProposal(tripId, user.sub, proposalId);
    }
};
exports.ProposalsController = ProposalsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List proposals for a trip' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProposalsController.prototype, "listProposals", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new proposal (any member)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_proposal_dto_1.CreateProposalDto, Object]),
    __metadata("design:returntype", Promise)
], ProposalsController.prototype, "createProposal", null);
__decorate([
    (0, common_1.Post)(':proposalId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a proposal (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('proposalId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProposalsController.prototype, "acceptProposal", null);
__decorate([
    (0, common_1.Post)(':proposalId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a proposal (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('proposalId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProposalsController.prototype, "rejectProposal", null);
exports.ProposalsController = ProposalsController = __decorate([
    (0, swagger_1.ApiTags)('Proposals'),
    (0, common_1.Controller)('trips/:tripId/proposals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [proposals_service_1.ProposalsService])
], ProposalsController);
//# sourceMappingURL=proposals.controller.js.map
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
exports.LogisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const logistics_service_1 = require("./logistics.service");
const create_logistics_unit_dto_1 = require("./dto/create-logistics-unit.dto");
const reassign_logistics_member_dto_1 = require("./dto/reassign-logistics-member.dto");
const self_join_logistics_slot_dto_1 = require("./dto/self-join-logistics-slot.dto");
const leave_logistics_slot_dto_1 = require("./dto/leave-logistics-slot.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let LogisticsController = class LogisticsController {
    constructor(logisticsService) {
        this.logisticsService = logisticsService;
    }
    async getAllocations(tripId, user) {
        return this.logisticsService.getAllocationSnapshot(tripId, user.sub);
    }
    async createUnit(tripId, dto, user) {
        return this.logisticsService.createUnit(tripId, user.sub, dto);
    }
    async updateUnit(tripId, unitId, dto, user) {
        return this.logisticsService.updateUnit(tripId, user.sub, unitId, dto);
    }
    async deleteUnit(tripId, unitId, user) {
        return this.logisticsService.deleteUnit(tripId, user.sub, unitId);
    }
    async selfJoin(tripId, dto, user) {
        return this.logisticsService.selfJoin(tripId, user.sub, dto);
    }
    async leave(tripId, dto, user) {
        return this.logisticsService.leave(tripId, user.sub, dto);
    }
    async reassign(tripId, dto, user) {
        return this.logisticsService.reassign(tripId, user.sub, dto);
    }
    async autoFill(tripId, body, user) {
        return this.logisticsService.autoFill(tripId, user.sub, body.type);
    }
};
exports.LogisticsController = LogisticsController;
__decorate([
    (0, common_1.Get)('allocations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get allocation snapshot for trip' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "getAllocations", null);
__decorate([
    (0, common_1.Post)('units'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a room or ride unit (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_logistics_unit_dto_1.CreateLogisticsUnitDto, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Patch)('units/:unitId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a logistics unit (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('unitId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "updateUnit", null);
__decorate([
    (0, common_1.Delete)('units/:unitId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a logistics unit (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('unitId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "deleteUnit", null);
__decorate([
    (0, common_1.Post)('assignments/self-join'),
    (0, swagger_1.ApiOperation)({ summary: 'Self-join an open logistics slot (Member)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, self_join_logistics_slot_dto_1.SelfJoinLogisticsSlotDto, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "selfJoin", null);
__decorate([
    (0, common_1.Post)('assignments/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave your current logistics slot (Member)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, leave_logistics_slot_dto_1.LeaveLogisticsSlotDto, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "leave", null);
__decorate([
    (0, common_1.Post)('assignments/reassign'),
    (0, swagger_1.ApiOperation)({ summary: 'Reassign a member to a different unit (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reassign_logistics_member_dto_1.ReassignLogisticsMemberDto, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "reassign", null);
__decorate([
    (0, common_1.Post)('auto-fill'),
    (0, swagger_1.ApiOperation)({ summary: 'Auto-fill unassigned members into available slots (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LogisticsController.prototype, "autoFill", null);
exports.LogisticsController = LogisticsController = __decorate([
    (0, swagger_1.ApiTags)('Logistics'),
    (0, common_1.Controller)('trips/:tripId/logistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [logistics_service_1.LogisticsService])
], LogisticsController);
//# sourceMappingURL=logistics.controller.js.map
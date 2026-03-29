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
exports.ChecklistsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const checklists_service_1 = require("./checklists.service");
const create_checklist_group_dto_1 = require("./dto/create-checklist-group.dto");
const create_checklist_item_dto_1 = require("./dto/create-checklist-item.dto");
const update_checklist_item_dto_1 = require("./dto/update-checklist-item.dto");
const submit_checklist_proof_dto_1 = require("./dto/submit-checklist-proof.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ChecklistsController = class ChecklistsController {
    constructor(checklistsService) {
        this.checklistsService = checklistsService;
    }
    async getSnapshot(tripId, user) {
        return this.checklistsService.getChecklistSnapshot(tripId, user.sub);
    }
    async createGroup(tripId, dto, user) {
        return this.checklistsService.createGroup(tripId, user.sub, dto);
    }
    async deleteGroup(tripId, groupId, user) {
        return this.checklistsService.deleteGroup(tripId, user.sub, groupId);
    }
    async createItem(tripId, dto, user) {
        return this.checklistsService.createItem(tripId, user.sub, dto);
    }
    async updateItem(tripId, itemId, dto, user) {
        return this.checklistsService.updateItem(tripId, user.sub, itemId, dto);
    }
    async deleteItem(tripId, itemId, user) {
        return this.checklistsService.deleteItem(tripId, user.sub, itemId);
    }
    async toggleItem(tripId, itemId, user) {
        return this.checklistsService.toggleItem(tripId, user.sub, itemId);
    }
    async submitProof(tripId, itemId, dto, user) {
        return this.checklistsService.submitProof(tripId, user.sub, itemId, dto);
    }
};
exports.ChecklistsController = ChecklistsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get checklist snapshot for trip' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "getSnapshot", null);
__decorate([
    (0, common_1.Post)('groups'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a checklist group (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_checklist_group_dto_1.CreateChecklistGroupDto, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:groupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a checklist group (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "deleteGroup", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a checklist item (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_checklist_item_dto_1.CreateChecklistItemDto, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a checklist item (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_checklist_item_dto_1.UpdateChecklistItemDto, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a checklist item (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Post)('items/:itemId/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle item done/todo (assigned member or leader)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "toggleItem", null);
__decorate([
    (0, common_1.Post)('items/:itemId/proof'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit checklist proof image for assigned member or leader' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, submit_checklist_proof_dto_1.SubmitChecklistProofDto, Object]),
    __metadata("design:returntype", Promise)
], ChecklistsController.prototype, "submitProof", null);
exports.ChecklistsController = ChecklistsController = __decorate([
    (0, swagger_1.ApiTags)('Checklists'),
    (0, common_1.Controller)('trips/:tripId/checklists'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [checklists_service_1.ChecklistsService])
], ChecklistsController);
//# sourceMappingURL=checklists.controller.js.map
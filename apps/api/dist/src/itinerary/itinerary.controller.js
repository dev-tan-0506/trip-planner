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
exports.ItineraryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const itinerary_service_1 = require("./itinerary.service");
const create_itinerary_item_dto_1 = require("./dto/create-itinerary-item.dto");
const update_itinerary_item_dto_1 = require("./dto/update-itinerary-item.dto");
const reorder_itinerary_dto_1 = require("./dto/reorder-itinerary.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ItineraryController = class ItineraryController {
    constructor(itineraryService) {
        this.itineraryService = itineraryService;
    }
    async getItinerary(tripId, user) {
        return this.itineraryService.getTripItinerarySnapshot(tripId, user.sub);
    }
    async createItem(tripId, dto, user) {
        return this.itineraryService.createItem(tripId, user.sub, dto);
    }
    async updateItem(tripId, itemId, dto, user) {
        return this.itineraryService.updateItem(tripId, user.sub, itemId, dto);
    }
    async deleteItem(tripId, itemId, user) {
        return this.itineraryService.deleteItem(tripId, user.sub, itemId);
    }
    async reorder(tripId, dto, user) {
        return this.itineraryService.reorderItems(tripId, user.sub, dto);
    }
};
exports.ItineraryController = ItineraryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get trip itinerary snapshot' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ItineraryController.prototype, "getItinerary", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an itinerary item (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_itinerary_item_dto_1.CreateItineraryItemDto, Object]),
    __metadata("design:returntype", Promise)
], ItineraryController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an itinerary item (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_itinerary_item_dto_1.UpdateItineraryItemDto, Object]),
    __metadata("design:returntype", Promise)
], ItineraryController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an itinerary item (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ItineraryController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Post)('reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder itinerary items (Leader only)' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reorder_itinerary_dto_1.ReorderItineraryDto, Object]),
    __metadata("design:returntype", Promise)
], ItineraryController.prototype, "reorder", null);
exports.ItineraryController = ItineraryController = __decorate([
    (0, swagger_1.ApiTags)('Itinerary'),
    (0, common_1.Controller)('trips/:tripId/itinerary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [itinerary_service_1.ItineraryService])
], ItineraryController);
//# sourceMappingURL=itinerary.controller.js.map
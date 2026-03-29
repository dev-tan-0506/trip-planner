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
exports.TemplatesController = exports.TripTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const templates_service_1 = require("./templates.service");
const publish_template_dto_1 = require("./dto/publish-template.dto");
const clone_template_dto_1 = require("./dto/clone-template.dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let TripTemplatesController = class TripTemplatesController {
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async getPublishedTemplate(tripId, user) {
        return this.templatesService.getPublishedTemplateForTrip(tripId, user.sub);
    }
    async publish(tripId, dto, user) {
        return this.templatesService.publishTemplate(tripId, user.sub, dto);
    }
};
exports.TripTemplatesController = TripTemplatesController;
__decorate([
    (0, common_1.Get)('published'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current published template status for this trip' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TripTemplatesController.prototype, "getPublishedTemplate", null);
__decorate([
    (0, common_1.Post)('publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a sanitized community template from this trip' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, publish_template_dto_1.PublishTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], TripTemplatesController.prototype, "publish", null);
exports.TripTemplatesController = TripTemplatesController = __decorate([
    (0, common_1.Controller)('trips/:tripId/templates'),
    (0, swagger_1.ApiTags)('Community Templates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TripTemplatesController);
let TemplatesController = class TemplatesController {
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async list() {
        return this.templatesService.listTemplates();
    }
    async get(templateId) {
        return this.templatesService.getTemplate(templateId);
    }
    async clone(templateId, dto, user) {
        return this.templatesService.cloneTemplate(templateId, user.sub, dto);
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all published community templates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template details with sanitized snapshot' }),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':templateId/clone'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Clone a template into a new trip' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, clone_template_dto_1.CloneTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "clone", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('templates'),
    (0, swagger_1.ApiTags)('Community Templates'),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map
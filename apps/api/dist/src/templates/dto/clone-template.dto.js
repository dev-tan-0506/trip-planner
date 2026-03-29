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
exports.CloneTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CloneTemplateDto {
}
exports.CloneTemplateDto = CloneTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the new trip' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloneTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination label for the new trip' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloneTemplateDto.prototype, "destination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date of the new trip' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CloneTemplateDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date of the new trip' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CloneTemplateDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IANA timezone for the new trip' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CloneTemplateDto.prototype, "timeZone", void 0);
//# sourceMappingURL=clone-template.dto.js.map
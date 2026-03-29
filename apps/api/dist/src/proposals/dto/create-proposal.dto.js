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
exports.CreateProposalDto = exports.ProposalType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ProposalType;
(function (ProposalType) {
    ProposalType["ADD_ITEM"] = "ADD_ITEM";
    ProposalType["UPDATE_TIME"] = "UPDATE_TIME";
    ProposalType["UPDATE_LOCATION"] = "UPDATE_LOCATION";
    ProposalType["UPDATE_NOTE"] = "UPDATE_NOTE";
})(ProposalType || (exports.ProposalType = ProposalType = {}));
class CreateProposalDto {
}
exports.CreateProposalDto = CreateProposalDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of proposal',
        enum: ProposalType,
    }),
    (0, class_validator_1.IsEnum)(ProposalType),
    __metadata("design:type", String)
], CreateProposalDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target item ID (required for update types)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProposalDto.prototype, "targetItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Proposal payload (varies by type)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateProposalDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Base version of target item for conflict detection' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateProposalDto.prototype, "baseVersion", void 0);
//# sourceMappingURL=create-proposal.dto.js.map
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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const attendance_service_1 = require("./attendance.service");
const create_attendance_session_dto_1 = require("./dto/create-attendance-session.dto");
const create_attendance_submission_dto_1 = require("./dto/create-attendance-submission.dto");
const attendance_gateway_1 = require("./attendance.gateway");
let AttendanceController = class AttendanceController {
    constructor(attendanceService, attendanceGateway) {
        this.attendanceService = attendanceService;
        this.attendanceGateway = attendanceGateway;
    }
    async getCurrentSession(tripId, user) {
        return this.attendanceService.getCurrentAttendanceSnapshot(tripId, user.sub);
    }
    async createSession(tripId, dto, user) {
        const result = await this.attendanceService.createSession(tripId, user.sub, dto);
        await this.attendanceGateway.broadcastAttendanceUpdated(tripId, result.sessionId);
        return result.snapshot;
    }
    async submitProof(sessionId, dto, user) {
        const result = await this.attendanceService.submitProof(sessionId, user.sub, dto);
        await this.attendanceGateway.broadcastAttendanceUpdated(result.tripId, result.sessionId);
        return result.snapshot;
    }
    async closeSession(sessionId, user) {
        const result = await this.attendanceService.closeSession(sessionId, user.sub);
        await this.attendanceGateway.broadcastAttendanceUpdated(result.tripId, result.sessionId);
        return result.snapshot;
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)('trips/:tripId/attendance/sessions/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current attendance snapshot for trip' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getCurrentSession", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/attendance/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Open a new attendance session for trip leader' }),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_attendance_session_dto_1.CreateAttendanceSessionDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('attendance/sessions/:sessionId/submissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit check-in proof for active attendance session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_attendance_submission_dto_1.CreateAttendanceSubmissionDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "submitProof", null);
__decorate([
    (0, common_1.Post)('attendance/sessions/:sessionId/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close an attendance session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "closeSession", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        attendance_gateway_1.AttendanceGateway])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map
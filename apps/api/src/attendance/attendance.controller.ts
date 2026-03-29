import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { CreateAttendanceSubmissionDto } from './dto/create-attendance-submission.dto';
import { AttendanceGateway } from './attendance.gateway';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceGateway: AttendanceGateway,
  ) {}

  @Get('trips/:tripId/attendance/sessions/current')
  @ApiOperation({ summary: 'Get current attendance snapshot for trip' })
  async getCurrentSession(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.getCurrentAttendanceSnapshot(tripId, user.sub);
  }

  @Post('trips/:tripId/attendance/sessions')
  @ApiOperation({ summary: 'Open a new attendance session for trip leader' })
  async createSession(
    @Param('tripId') tripId: string,
    @Body() dto: CreateAttendanceSessionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.attendanceService.createSession(tripId, user.sub, dto);
    await this.attendanceGateway.broadcastAttendanceUpdated(tripId, result.sessionId);
    return result.snapshot;
  }

  @Post('attendance/sessions/:sessionId/submissions')
  @ApiOperation({ summary: 'Submit check-in proof for active attendance session' })
  async submitProof(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateAttendanceSubmissionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.attendanceService.submitProof(sessionId, user.sub, dto);
    await this.attendanceGateway.broadcastAttendanceUpdated(result.tripId, result.sessionId);
    return result.snapshot;
  }

  @Post('attendance/sessions/:sessionId/close')
  @ApiOperation({ summary: 'Close an attendance session' })
  async closeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.attendanceService.closeSession(sessionId, user.sub);
    await this.attendanceGateway.broadcastAttendanceUpdated(result.tripId, result.sessionId);
    return result.snapshot;
  }
}

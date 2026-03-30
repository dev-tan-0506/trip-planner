import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { SafetyService } from './safety.service';
import { CreateSosAlertDto } from './dto/create-sos-alert.dto';
import { AcknowledgeSafetyAlertDto } from './dto/acknowledge-safety-alert.dto';
import { SafetyGateway } from './safety.gateway';

@ApiTags('Safety')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/safety')
export class SafetyController {
  constructor(
    private readonly safetyService: SafetyService,
    private readonly safetyGateway: SafetyGateway,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get safety overview' })
  getOverview(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.safetyService.getSafetyOverview(tripId, user.sub);
  }

  @Get('directory')
  @ApiOperation({ summary: 'Get safety directory' })
  getDirectory(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.safetyService.getSafetyDirectory(tripId, user.sub);
  }

  @Get('warnings')
  @ApiOperation({ summary: 'Get cultural warnings and active alerts' })
  getWarnings(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.safetyService.getWarnings(tripId, user.sub);
  }

  @Post('sos')
  @ApiOperation({ summary: 'Create SOS alert' })
  async createSos(
    @Param('tripId') tripId: string,
    @Body() dto: CreateSosAlertDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.safetyService.createSosAlert(tripId, user.sub, dto);
    await this.safetyGateway.broadcast(tripId);
    return result;
  }

  @Post('alerts/:alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge safety alert' })
  async acknowledge(
    @Param('tripId') tripId: string,
    @Param('alertId') alertId: string,
    @Body() _dto: AcknowledgeSafetyAlertDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.safetyService.acknowledgeAlert(tripId, alertId, user.sub);
    await this.safetyGateway.broadcast(tripId);
    return result;
  }
}

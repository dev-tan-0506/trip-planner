import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { CreateLogisticsUnitDto } from './dto/create-logistics-unit.dto';
import { ReassignLogisticsMemberDto } from './dto/reassign-logistics-member.dto';
import { SelfJoinLogisticsSlotDto } from './dto/self-join-logistics-slot.dto';
import { LeaveLogisticsSlotDto } from './dto/leave-logistics-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Logistics')
@Controller('trips/:tripId/logistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('allocations')
  @ApiOperation({ summary: 'Get allocation snapshot for trip' })
  async getAllocations(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.getAllocationSnapshot(tripId, user.sub);
  }

  @Post('units')
  @ApiOperation({ summary: 'Create a room or ride unit (Leader only)' })
  async createUnit(
    @Param('tripId') tripId: string,
    @Body() dto: CreateLogisticsUnitDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.createUnit(tripId, user.sub, dto);
  }

  @Patch('units/:unitId')
  @ApiOperation({ summary: 'Update a logistics unit (Leader only)' })
  async updateUnit(
    @Param('tripId') tripId: string,
    @Param('unitId') unitId: string,
    @Body() dto: Partial<CreateLogisticsUnitDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.updateUnit(tripId, user.sub, unitId, dto);
  }

  @Delete('units/:unitId')
  @ApiOperation({ summary: 'Delete a logistics unit (Leader only)' })
  async deleteUnit(
    @Param('tripId') tripId: string,
    @Param('unitId') unitId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.deleteUnit(tripId, user.sub, unitId);
  }

  @Post('assignments/self-join')
  @ApiOperation({ summary: 'Self-join an open logistics slot (Member)' })
  async selfJoin(
    @Param('tripId') tripId: string,
    @Body() dto: SelfJoinLogisticsSlotDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.selfJoin(tripId, user.sub, dto);
  }

  @Post('assignments/leave')
  @ApiOperation({ summary: 'Leave your current logistics slot (Member)' })
  async leave(
    @Param('tripId') tripId: string,
    @Body() dto: LeaveLogisticsSlotDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.leave(tripId, user.sub, dto);
  }

  @Post('assignments/reassign')
  @ApiOperation({ summary: 'Reassign a member to a different unit (Leader only)' })
  async reassign(
    @Param('tripId') tripId: string,
    @Body() dto: ReassignLogisticsMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.reassign(tripId, user.sub, dto);
  }

  @Post('auto-fill')
  @ApiOperation({ summary: 'Auto-fill unassigned members into available slots (Leader only)' })
  async autoFill(
    @Param('tripId') tripId: string,
    @Body() body: { type: 'ROOM' | 'RIDE' },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.logisticsService.autoFill(tripId, user.sub, body.type);
  }
}

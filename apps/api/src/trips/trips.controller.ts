import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new trip (Leader only)' })
  async create(
    @Body() dto: CreateTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.create(dto, user.sub);
  }

  @Get(':joinCode')
  @ApiOperation({ summary: 'Get trip by join code (Public — no auth required)' })
  async findByJoinCode(@Param('joinCode') joinCode: string) {
    return this.tripsService.findByJoinCode(joinCode);
  }

  @Get(':joinCode/private')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trip by join code with private member details' })
  async findPrivateByJoinCode(
    @Param('joinCode') joinCode: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.findPrivateByJoinCode(joinCode, user.sub);
  }

  @Post(':joinCode/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a trip via join code' })
  async joinTrip(
    @Param('joinCode') joinCode: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.joinTrip(joinCode, user.sub);
  }
}

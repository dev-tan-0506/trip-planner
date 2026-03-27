import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new trip (Leader only)' })
  async create(@Body() dto: CreateTripDto) {
    // TODO: Extract userId from JWT auth guard
    const tempLeaderId = 'temp-leader-id';
    return this.tripsService.create(dto, tempLeaderId);
  }

  @Get(':joinCode')
  @ApiOperation({ summary: 'Get trip by join code (Public — no auth required)' })
  async findByJoinCode(@Param('joinCode') joinCode: string) {
    return this.tripsService.findByJoinCode(joinCode);
  }

  @Post(':joinCode/join')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a trip via join code' })
  async joinTrip(@Param('joinCode') joinCode: string) {
    // TODO: Extract userId from JWT auth guard
    const tempUserId = 'temp-user-id';
    return this.tripsService.joinTrip(joinCode, tempUserId);
  }
}

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
import { ItineraryService } from './itinerary.service';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { ReorderItineraryDto } from './dto/reorder-itinerary.dto';
import { RequestCulinaryRouteDto } from './dto/request-culinary-route.dto';
import { ApplyCulinaryRouteDto } from './dto/apply-culinary-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Itinerary')
@Controller('trips/:tripId/itinerary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Get()
  @ApiOperation({ summary: 'Get trip itinerary snapshot' })
  async getItinerary(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itineraryService.getTripItinerarySnapshot(tripId, user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Create an itinerary item (Leader only)' })
  async createItem(
    @Param('tripId') tripId: string,
    @Body() dto: CreateItineraryItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itineraryService.createItem(tripId, user.sub, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update an itinerary item (Leader only)' })
  async updateItem(
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItineraryItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itineraryService.updateItem(tripId, user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Delete an itinerary item (Leader only)' })
  async deleteItem(
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itineraryService.deleteItem(tripId, user.sub, itemId);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder itinerary items (Leader only)' })
  async reorder(
    @Param('tripId') tripId: string,
    @Body() dto: ReorderItineraryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itineraryService.reorderItems(tripId, user.sub, dto);
  }

  @Post('culinary-route/suggest')
  @ApiOperation({ summary: 'Suggest a culinary route draft for selected itinerary items' })
  async suggestCulinaryRoute(
    @Param('tripId') tripId: string,
    @Body() dto: RequestCulinaryRouteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itineraryService.requestCulinaryRoute(tripId, user.sub, dto);
  }

  @Post('culinary-route/apply')
  @ApiOperation({ summary: 'Apply a reviewed culinary route to itinerary order (Leader only)' })
  async applyCulinaryRoute(
    @Param('tripId') tripId: string,
    @Body() dto: ApplyCulinaryRouteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itineraryService.applyCulinaryRoute(tripId, user.sub, dto);
  }
}

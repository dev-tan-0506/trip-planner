import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingImportService } from './booking-import.service';
import { ConfirmBookingImportDto } from './dto/confirm-booking-import.dto';
import { CreateBookingImportDraftDto } from './dto/create-booking-import-draft.dto';

@ApiTags('Booking Import')
@Controller()
export class BookingImportController {
  constructor(private readonly bookingImportService: BookingImportService) {}

  @Get('trips/:tripId/booking-import/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking import forwarding configuration for a trip' })
  getImportConfig(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.bookingImportService.getImportConfig(tripId, user.sub);
  }

  @Get('trips/:tripId/booking-import/drafts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List booking import drafts for a trip' })
  listDrafts(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.bookingImportService.listDrafts(tripId, user.sub);
  }

  @Post('trips/:tripId/booking-import/drafts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a booking import draft from raw pasted content' })
  createDraft(
    @Param('tripId') tripId: string,
    @Body() dto: CreateBookingImportDraftDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingImportService.createDraftFromRawContent(tripId, user.sub, dto);
  }

  @Post('booking-import/inbound')
  @ApiOperation({ summary: 'Create a booking import draft from an inbound forwarded message' })
  createInboundDraft(
    @Body()
    dto: {
      recipientAddress: string;
      rawContent: string;
      sourceSender?: string;
      sourceSubject?: string;
      sourceMessageId?: string;
    },
  ) {
    return this.bookingImportService.createDraftFromInbound(dto);
  }

  @Post('trips/:tripId/booking-import/drafts/:draftId/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm a reviewed booking draft into itinerary items' })
  confirmDraft(
    @Param('tripId') tripId: string,
    @Param('draftId') draftId: string,
    @Body() dto: ConfirmBookingImportDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingImportService.confirmBookingImportDraft(tripId, draftId, user.sub, dto);
  }
}

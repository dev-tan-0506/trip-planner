import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewVaultDocumentDto } from './dto/review-vault-document.dto';
import { SubmitAnonymousFeedbackDto } from './dto/submit-anonymous-feedback.dto';
import { RespondReunionAvailabilityDto } from './dto/respond-reunion-availability.dto';
import { FinalizeReunionInviteDto } from './dto/finalize-reunion-invite.dto';
import { UploadVaultDocumentDto } from './dto/upload-vault-document.dto';
import { MemoriesService } from './memories.service';

@ApiTags('Memories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Get('vault')
  @ApiOperation({ summary: 'Get Digital Vault snapshot for a trip' })
  getVault(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.memoriesService.getVaultSnapshot(tripId, user.sub);
  }

  @Post('vault/documents')
  @ApiOperation({ summary: 'Upload a Digital Vault document' })
  uploadVaultDocument(
    @Param('tripId') tripId: string,
    @Body() dto: UploadVaultDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memoriesService.uploadVaultDocument(tripId, user.sub, dto);
  }

  @Patch('vault/documents/:documentId/review')
  @ApiOperation({ summary: 'Review a Digital Vault document (Leader only)' })
  reviewVaultDocument(
    @Param('tripId') tripId: string,
    @Param('documentId') documentId: string,
    @Body() dto: ReviewVaultDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memoriesService.reviewVaultDocument(tripId, user.sub, documentId, dto);
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Get anonymous feedback snapshot for a trip' })
  getFeedback(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.memoriesService.getFeedbackSnapshot(tripId, user.sub);
  }

  @Post('feedback/submissions')
  @ApiOperation({ summary: 'Submit anonymous feedback for a finished trip' })
  submitAnonymousFeedback(
    @Param('tripId') tripId: string,
    @Body() dto: SubmitAnonymousFeedbackDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memoriesService.submitAnonymousFeedback(tripId, user.sub, dto);
  }

  @Post('feedback/close')
  @ApiOperation({ summary: 'Close anonymous feedback poll (Leader only)' })
  closeFeedback(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.memoriesService.closeFeedbackPoll(tripId, user.sub);
  }

  @Get('souvenirs')
  getSouvenirs(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.memoriesService.getSouvenirSnapshot(tripId, user.sub);
  }

  @Get('reunion')
  getReunion(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.memoriesService.getReunionSnapshot(tripId, user.sub);
  }

  @Post('reunion/availability')
  respondReunionAvailability(
    @Param('tripId') tripId: string,
    @Body() dto: RespondReunionAvailabilityDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memoriesService.respondReunionAvailability(tripId, user.sub, dto);
  }

  @Post('reunion/finalize')
  finalizeReunionInvite(
    @Param('tripId') tripId: string,
    @Body() dto: FinalizeReunionInviteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memoriesService.finalizeReunionInvite(tripId, user.sub, dto);
  }
}

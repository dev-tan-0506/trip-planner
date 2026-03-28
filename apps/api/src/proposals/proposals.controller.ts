import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Proposals')
@Controller('trips/:tripId/proposals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'List proposals for a trip' })
  async listProposals(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.proposalsService.listProposals(tripId, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new proposal (any member)' })
  async createProposal(
    @Param('tripId') tripId: string,
    @Body() dto: CreateProposalDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.proposalsService.createProposal(tripId, user.sub, dto);
  }

  @Post(':proposalId/accept')
  @ApiOperation({ summary: 'Accept a proposal (Leader only)' })
  async acceptProposal(
    @Param('tripId') tripId: string,
    @Param('proposalId') proposalId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.proposalsService.acceptProposal(tripId, user.sub, proposalId);
  }

  @Post(':proposalId/reject')
  @ApiOperation({ summary: 'Reject a proposal (Leader only)' })
  async rejectProposal(
    @Param('tripId') tripId: string,
    @Param('proposalId') proposalId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.proposalsService.rejectProposal(tripId, user.sub, proposalId);
  }
}

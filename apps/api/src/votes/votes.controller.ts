import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VotesService } from './votes.service';
import { CreateVoteSessionDto } from './dto/create-vote-session.dto';
import { SubmitBallotDto } from './dto/submit-ballot.dto';
import { CreateVoteOptionDto } from './dto/create-vote-option.dto';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';

@Controller('trips/:tripId/votes')
@ApiTags('Vote Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new vote session' })
  async createSession(
    @Param('tripId') tripId: string,
    @Body() dto: CreateVoteSessionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.createSession(tripId, user.sub, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List all vote sessions for a trip' })
  async listSessions(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.listSessions(tripId, user.sub);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get a single vote session with snapshot' })
  async getSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.getSession(sessionId, user.sub);
  }
}

@Controller('vote-sessions')
@ApiTags('Vote Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class VoteSessionsController {
  constructor(private readonly votesService: VotesService) {}

  @Post(':sessionId/approve')
  @ApiOperation({ summary: 'Leader approves a pending session' })
  async approveSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.approveSession(sessionId, user.sub);
  }

  @Post(':sessionId/ballot')
  @ApiOperation({ summary: 'Submit or update a ballot' })
  async submitBallot(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitBallotDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.submitBallot(sessionId, user.sub, dto);
  }

  @Post(':sessionId/options')
  @ApiOperation({ summary: 'Add an option to a session' })
  async createOption(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateVoteOptionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.createOption(sessionId, user.sub, dto);
  }

  @Post(':sessionId/options/:optionId/approve')
  @ApiOperation({ summary: 'Leader approves a pending option' })
  async approveOption(
    @Param('sessionId') sessionId: string,
    @Param('optionId') optionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.approveOption(sessionId, optionId, user.sub);
  }

  @Post(':sessionId/resolve')
  @ApiOperation({ summary: 'Leader resolves a tie-break decision' })
  async resolveLeaderDecision(
    @Param('sessionId') sessionId: string,
    @Body() body: { winningOptionId: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.votesService.resolveLeaderDecision(
      sessionId,
      user.sub,
      body.winningOptionId,
    );
  }
}

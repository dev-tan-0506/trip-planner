import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { FundService } from './fund.service';
import { CreateTripFundDto } from './dto/create-trip-fund.dto';
import { CreateFundContributionDto } from './dto/create-fund-contribution.dto';
import { CreateFundExpenseDto } from './dto/create-fund-expense.dto';

@ApiTags('Fund')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips/:tripId/fund')
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Get()
  @ApiOperation({ summary: 'Get trip fund snapshot' })
  getFund(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.fundService.getFundSnapshot(tripId, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a trip fund' })
  createFund(
    @Param('tripId') tripId: string,
    @Body() dto: CreateTripFundDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fundService.createFund(tripId, user.sub, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a trip fund' })
  updateFund(
    @Param('tripId') tripId: string,
    @Body() dto: CreateTripFundDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fundService.updateFund(tripId, user.sub, dto);
  }

  @Post('contributions')
  @ApiOperation({ summary: 'Submit contribution confirmation' })
  submitContribution(
    @Param('tripId') tripId: string,
    @Body() dto: CreateFundContributionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fundService.submitContribution(tripId, user.sub, dto);
  }

  @Post('contributions/:contributionId/confirm')
  @ApiOperation({ summary: 'Confirm a contribution' })
  confirmContribution(
    @Param('tripId') tripId: string,
    @Param('contributionId') contributionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fundService.confirmContribution(tripId, contributionId, user.sub);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create a fund expense' })
  createExpense(
    @Param('tripId') tripId: string,
    @Body() dto: CreateFundExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fundService.createExpense(tripId, user.sub, dto);
  }
}

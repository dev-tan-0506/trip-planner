import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestHiddenSpotsDto } from './dto/request-hidden-spots.dto';
import { RequestOutfitPlanDto } from './dto/request-outfit-plan.dto';
import { TranslateMenuDto } from './dto/translate-menu.dto';
import { LocalExpertService } from './local-expert.service';

@ApiTags('Local Expert')
@Controller('trips/:tripId/local-expert')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocalExpertController {
  constructor(private readonly localExpertService: LocalExpertService) {}

  @Post('menu-translate')
  @ApiOperation({ summary: 'Translate a short menu excerpt into compact dish cards' })
  translateMenu(
    @Param('tripId') tripId: string,
    @Body() dto: TranslateMenuDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.localExpertService.translateMenu(tripId, user.sub, dto);
  }

  @Post('hidden-spots')
  @ApiOperation({ summary: 'Suggest compact hidden spot cards for a nearby area' })
  requestHiddenSpots(
    @Param('tripId') tripId: string,
    @Body() dto: RequestHiddenSpotsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.localExpertService.requestHiddenSpots(tripId, user.sub, dto);
  }

  @Post('outfit-plan')
  @ApiOperation({ summary: 'Return a compact 3-card outfit direction for a trip day' })
  requestOutfitPlan(
    @Param('tripId') tripId: string,
    @Body() dto: RequestOutfitPlanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.localExpertService.requestOutfitPlan(tripId, user.sub, dto);
  }
}

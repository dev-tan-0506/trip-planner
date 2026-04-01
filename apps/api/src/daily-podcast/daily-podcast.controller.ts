import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateDailyPodcastDto } from './dto/generate-daily-podcast.dto';
import { DailyPodcastService } from './daily-podcast.service';

@ApiTags('Daily Podcast')
@Controller('trips/:tripId/daily-podcast')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DailyPodcastController {
  constructor(private readonly dailyPodcastService: DailyPodcastService) {}

  @Get(':dayIndex')
  @ApiOperation({ summary: 'Get a persisted daily podcast recap for a trip day' })
  getDailyPodcast(
    @Param('tripId') tripId: string,
    @Param('dayIndex', ParseIntPipe) dayIndex: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dailyPodcastService.getDailyPodcast(tripId, dayIndex, user.sub);
  }

  @Post(':dayIndex/generate')
  @ApiOperation({ summary: 'Generate or refresh a daily podcast recap for a trip day' })
  generateDailyPodcast(
    @Param('tripId') tripId: string,
    @Param('dayIndex', ParseIntPipe) dayIndex: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateDailyPodcastDto,
  ) {
    return this.dailyPodcastService.generateDailyPodcast(tripId, dayIndex, user.sub, dto);
  }
}

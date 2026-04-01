import { Module } from '@nestjs/common';
import { DailyPodcastController } from './daily-podcast.controller';
import { DailyPodcastService } from './daily-podcast.service';

@Module({
  controllers: [DailyPodcastController],
  providers: [DailyPodcastService],
})
export class DailyPodcastModule {}

import { Module } from '@nestjs/common';
import { TemplatesController, TripTemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  controllers: [TemplatesController, TripTemplatesController],
  providers: [TemplatesService],
})
export class TemplatesModule {}

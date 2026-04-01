import { Module } from '@nestjs/common';
import { LocalExpertController } from './local-expert.controller';
import { LocalExpertService } from './local-expert.service';

@Module({
  controllers: [LocalExpertController],
  providers: [LocalExpertService],
})
export class LocalExpertModule {}

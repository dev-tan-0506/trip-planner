import { Module } from '@nestjs/common';
import { VotesController, VoteSessionsController } from './votes.controller';
import { VotesService } from './votes.service';
import { VotesGateway } from './votes.gateway';

@Module({
  controllers: [VotesController, VoteSessionsController],
  providers: [VotesService, VotesGateway],
  exports: [VotesService, VotesGateway],
})
export class VotesModule {}

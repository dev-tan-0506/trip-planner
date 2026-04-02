import { Module } from '@nestjs/common';
import { MemoriesController } from './memories.controller';
import { MemoriesService } from './memories.service';
import { ReunionInviteMailerService } from './reunion-invite-mailer.service';
import { VaultStorageService } from './vault-storage.service';

@Module({
  controllers: [MemoriesController],
  providers: [MemoriesService, VaultStorageService, ReunionInviteMailerService],
  exports: [MemoriesService, VaultStorageService, ReunionInviteMailerService],
})
export class MemoriesModule {}

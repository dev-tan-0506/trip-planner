import { Module } from '@nestjs/common';
import { ChecklistsController } from './checklists.controller';
import { ChecklistsService } from './checklists.service';
import { ChecklistProofStorageService } from './checklist-proof-storage.service';

@Module({
  controllers: [ChecklistsController],
  providers: [ChecklistsService, ChecklistProofStorageService],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}

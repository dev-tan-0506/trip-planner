import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceGateway } from './attendance.gateway';
import { ProofStorageService } from './proof-storage.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceGateway, ProofStorageService],
  exports: [AttendanceService],
})
export class AttendanceModule {}

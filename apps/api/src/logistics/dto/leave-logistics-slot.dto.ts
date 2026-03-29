import { IsEnum } from 'class-validator';

export class LeaveLogisticsSlotDto {
  @IsEnum(['ROOM', 'RIDE'])
  type!: 'ROOM' | 'RIDE';
}

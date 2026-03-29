import { IsString } from 'class-validator';

export class SelfJoinLogisticsSlotDto {
  @IsString()
  unitId!: string;
}

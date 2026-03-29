import { IsOptional, IsString } from 'class-validator';

export class SelfJoinLogisticsSlotDto {
  @IsString()
  unitId!: string;

  @IsString()
  @IsOptional()
  seatLabel?: string;
}

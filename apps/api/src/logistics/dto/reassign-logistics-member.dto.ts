import { IsOptional, IsString } from 'class-validator';

export class ReassignLogisticsMemberDto {
  @IsString()
  tripMemberId!: string;

  @IsString()
  targetUnitId!: string;

  @IsString()
  @IsOptional()
  targetSeatLabel?: string;
}

import { IsOptional, IsString } from 'class-validator';

export class AcknowledgeSafetyAlertDto {
  @IsOptional()
  @IsString()
  note?: string;
}

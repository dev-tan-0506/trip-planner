import { IsOptional, IsString } from 'class-validator';

export class CreateSosAlertDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  linkedItineraryItemId?: string;
}

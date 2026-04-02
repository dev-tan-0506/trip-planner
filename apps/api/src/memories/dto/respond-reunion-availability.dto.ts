import { IsArray, IsOptional, IsString } from 'class-validator';

export class RespondReunionAvailabilityDto {
  @IsArray()
  @IsString({ each: true })
  selectedDates!: string[];

  @IsOptional()
  @IsString()
  note?: string;
}

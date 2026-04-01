import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class RequestOutfitPlanDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dayIndex!: number;

  @IsOptional()
  @IsString()
  aestheticHint!: string;

  @IsOptional()
  @IsString()
  weatherLabel!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activityLabels!: string[];
}

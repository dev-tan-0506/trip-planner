import { IsOptional, IsString, MinLength } from 'class-validator';

export class RequestHiddenSpotsDto {
  @IsString()
  @MinLength(2)
  areaLabel!: string;

  @IsOptional()
  @IsString()
  vibe!: string;

  @IsOptional()
  @IsString()
  budgetHint!: string;
}

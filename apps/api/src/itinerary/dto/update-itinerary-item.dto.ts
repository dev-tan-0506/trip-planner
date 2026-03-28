import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Matches,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateItineraryItemDto {
  @ApiPropertyOptional({ description: 'Activity title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Day index' })
  @IsOptional()
  @IsInt()
  @Min(0)
  dayIndex?: number;

  @ApiPropertyOptional({ description: 'Start time in HH:mm format' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @ApiPropertyOptional({ description: 'Location name' })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({ description: 'Short note' })
  @IsOptional()
  @IsString()
  shortNote?: string;

  @ApiPropertyOptional({ description: 'Full address' })
  @IsOptional()
  @IsString()
  locationAddress?: string;

  @ApiPropertyOptional({ description: 'Google Place ID' })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  lng?: number;
}

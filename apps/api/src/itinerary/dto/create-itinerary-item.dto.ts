import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItineraryItemDto {
  @ApiProperty({ description: 'Activity title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Day index (0-based from trip start)' })
  @IsInt()
  @Min(0)
  dayIndex: number;

  @ApiPropertyOptional({ description: 'Insert after this item ID (for ordering)' })
  @IsOptional()
  @IsString()
  insertAfterItemId?: string;

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

  // Detailed mode fields
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

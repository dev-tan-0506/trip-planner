import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ConfirmBookingImportItemDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  bookingCode?: string;

  @IsArray()
  @IsString({ each: true })
  missingFields: string[];

  @IsOptional()
  @IsString()
  rawExcerpt?: string;
}

export class ConfirmBookingImportDto {
  @ApiPropertyOptional({ type: [ConfirmBookingImportItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConfirmBookingImportItemDto)
  parsedItems?: ConfirmBookingImportItemDto[];
}

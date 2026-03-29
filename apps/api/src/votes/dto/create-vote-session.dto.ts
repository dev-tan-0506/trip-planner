import { IsString, IsEnum, IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CreateVoteSessionMode {
  NEW_OPTION = 'NEW_OPTION',
  REPLACE_ITEM = 'REPLACE_ITEM',
}

export class CreateVoteSessionDto {
  @ApiProperty({ enum: CreateVoteSessionMode })
  @IsEnum(CreateVoteSessionMode)
  mode: CreateVoteSessionMode;

  @ApiProperty({ description: 'Deadline for voting' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ description: 'Human-readable vote description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Target item ID (required for REPLACE_ITEM)' })
  @IsOptional()
  @IsString()
  targetItemId?: string;

  @ApiPropertyOptional({ description: 'Target day index (required for NEW_OPTION)' })
  @IsOptional()
  @IsInt()
  targetDayIndex?: number;

  @ApiPropertyOptional({ description: 'Insert after this item ID (for NEW_OPTION ordering)' })
  @IsOptional()
  @IsString()
  targetInsertAfterItemId?: string;
}

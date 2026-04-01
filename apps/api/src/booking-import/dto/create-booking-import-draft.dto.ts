import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBookingImportDraftDto {
  @ApiProperty({ description: 'Raw booking text pasted by the user' })
  @IsString()
  rawContent: string;

  @ApiPropertyOptional({ description: 'Original sender email or label' })
  @IsOptional()
  @IsString()
  sourceSender?: string;

  @ApiPropertyOptional({ description: 'Original subject line' })
  @IsOptional()
  @IsString()
  sourceSubject?: string;

  @ApiPropertyOptional({ description: 'Original message id from the source system' })
  @IsOptional()
  @IsString()
  sourceMessageId?: string;
}

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublishTemplateDto {
  @ApiProperty({ description: 'Template title for the library listing' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Short summary of the itinerary' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'Cover note / description' })
  @IsOptional()
  @IsString()
  coverNote?: string;
}

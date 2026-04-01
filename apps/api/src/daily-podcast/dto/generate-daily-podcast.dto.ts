import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GenerateDailyPodcastDto {
  @ApiPropertyOptional({ description: 'Optional tonal hint for the generated recap' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() ? value.trim() : 'playful'))
  tone?: string = 'playful';

  @ApiPropertyOptional({ description: 'Regenerate and overwrite the recap for this day' })
  @IsOptional()
  @IsBoolean()
  refresh?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class RequestCulinaryRouteDto {
  @ApiProperty({ type: [String], description: 'Selected itinerary item IDs for culinary routing' })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  itemIds: string[];

  @ApiPropertyOptional({ description: 'Preferred travel mode', default: 'WALKING' })
  @IsOptional()
  @IsString()
  travelMode: string = 'WALKING';
}

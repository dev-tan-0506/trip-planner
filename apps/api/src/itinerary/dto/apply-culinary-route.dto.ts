import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ApplyCulinaryRouteDto {
  @ApiProperty({ type: [String], description: 'Ordered itinerary item IDs to apply' })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  orderedItemIds: string[];

  @ApiProperty({ description: 'Suggestion token returned by the suggestion endpoint' })
  @IsString()
  sourceSuggestionId: string;
}

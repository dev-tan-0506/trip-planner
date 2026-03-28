import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderItemDto {
  @ApiProperty({ description: 'Item ID' })
  @IsString()
  itemId: string;

  @ApiProperty({ description: 'Target day index' })
  @IsInt()
  @Min(0)
  dayIndex: number;

  @ApiProperty({ description: 'Target sort order' })
  @IsInt()
  @Min(1)
  sortOrder: number;
}

export class ReorderItineraryDto {
  @ApiProperty({ type: [ReorderItemDto], description: 'Ordered array of items with new positions' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}

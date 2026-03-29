import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'Đà Lạt Mộng Mơ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Đà Lạt, Lâm Đồng' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ example: '2026-04-15T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-04-18T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloneTemplateDto {
  @ApiProperty({ description: 'Name of the new trip' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Destination label for the new trip' })
  @IsString()
  destination: string;

  @ApiProperty({ description: 'Start date of the new trip' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the new trip' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'IANA timezone for the new trip' })
  @IsString()
  timeZone: string;
}

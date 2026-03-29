import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLogisticsUnitDto {
  @IsEnum(['ROOM', 'RIDE'])
  type!: 'ROOM' | 'RIDE';

  @IsString()
  label!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(['MOTORBIKE', 'CAR', 'BUS'])
  @IsOptional()
  rideKind?: 'MOTORBIKE' | 'CAR' | 'BUS';

  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsArray()
  @IsOptional()
  seatLabels?: string[];
}

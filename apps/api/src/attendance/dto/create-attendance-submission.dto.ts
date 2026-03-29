import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceSubmissionDto {
  @IsOptional()
  @IsString()
  imageDataUrl?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  accuracyMeters?: number;

  @IsEnum(['GRANTED', 'DENIED', 'UNAVAILABLE'])
  locationStatus!: 'GRANTED' | 'DENIED' | 'UNAVAILABLE';
}

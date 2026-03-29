import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceSessionDto {
  @IsString()
  title!: string;

  @IsString()
  meetingLabel!: string;

  @IsString()
  meetingAddress!: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsDateString()
  opensAt!: string;

  @IsDateString()
  closesAt!: string;
}

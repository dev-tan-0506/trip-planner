import { IsOptional, IsString } from 'class-validator';

export class UpdateChecklistItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assigneeTripMemberId?: string;
}

import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateChecklistItemDto {
  @IsString()
  groupId!: string;

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assigneeTripMemberId?: string;

  @IsOptional()
  @IsBoolean()
  applyToAllMembers?: boolean;
}

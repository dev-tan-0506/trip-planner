import { IsEnum, IsString } from 'class-validator';

export class CreateChecklistGroupDto {
  @IsString()
  title!: string;

  @IsEnum(['SHARED_CATEGORY', 'PERSONAL_TASKS', 'DOCUMENTS'])
  kind!: 'SHARED_CATEGORY' | 'PERSONAL_TASKS' | 'DOCUMENTS';
}

import { IsOptional, IsString, MinLength } from 'class-validator';

export class TranslateMenuDto {
  @IsString()
  @MinLength(3)
  menuText!: string;

  @IsOptional()
  @IsString()
  localeHint: string = 'vi';
}

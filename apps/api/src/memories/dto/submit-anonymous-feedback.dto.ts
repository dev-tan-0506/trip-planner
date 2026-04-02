import { IsInt, IsString, Max, Min } from 'class-validator';

export class SubmitAnonymousFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore!: number;

  @IsString()
  highlight!: string;

  @IsString()
  wishNextTime!: string;
}

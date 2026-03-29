import { IsString } from 'class-validator';

export class SubmitChecklistProofDto {
  @IsString()
  imageDataUrl!: string;
}

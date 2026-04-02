import { IsString } from 'class-validator';

export class FinalizeReunionInviteDto {
  @IsString()
  finalizedDate!: string;
}

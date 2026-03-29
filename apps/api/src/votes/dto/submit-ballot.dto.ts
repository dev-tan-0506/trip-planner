import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitBallotDto {
  @ApiProperty({ description: 'The option ID to vote for' })
  @IsString()
  voteOptionId: string;
}

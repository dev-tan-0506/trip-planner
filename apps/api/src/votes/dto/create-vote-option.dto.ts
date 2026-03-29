import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoteOptionDto {
  @ApiProperty({ description: 'Option title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Option payload (varies by session mode)' })
  @IsObject()
  payload: Record<string, unknown>;
}

import { IsString, IsEnum, IsOptional, IsInt, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProposalType {
  ADD_ITEM = 'ADD_ITEM',
  UPDATE_TIME = 'UPDATE_TIME',
  UPDATE_LOCATION = 'UPDATE_LOCATION',
  UPDATE_NOTE = 'UPDATE_NOTE',
}

export class CreateProposalDto {
  @ApiProperty({
    description: 'Type of proposal',
    enum: ProposalType,
  })
  @IsEnum(ProposalType)
  type: ProposalType;

  @ApiPropertyOptional({ description: 'Target item ID (required for update types)' })
  @IsOptional()
  @IsString()
  targetItemId?: string;

  @ApiProperty({ description: 'Proposal payload (varies by type)' })
  @IsObject()
  payload: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Base version of target item for conflict detection' })
  @IsOptional()
  @IsInt()
  baseVersion?: number;
}

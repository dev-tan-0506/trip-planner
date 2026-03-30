import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateFundContributionDto {
  @IsNumberString()
  declaredAmount!: string;

  @IsIn(['MOMO', 'BANK_TRANSFER', 'CASH', 'OTHER'])
  method!: 'MOMO' | 'BANK_TRANSFER' | 'CASH' | 'OTHER';

  @IsOptional()
  @IsString()
  transferNote?: string;
}

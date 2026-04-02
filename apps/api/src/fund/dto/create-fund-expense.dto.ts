import { IsDateString, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateFundExpenseDto {
  @IsString()
  title!: string;

  @IsNumberString()
  amount!: string;

  @IsIn(['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'TICKETS', 'EMERGENCY', 'OTHER'])
  category!: 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'TICKETS' | 'EMERGENCY' | 'OTHER';

  @IsDateString()
  incurredAt!: string;

  @IsOptional()
  @IsString()
  linkedItineraryItemId?: string;

  @IsOptional()
  @IsString()
  merchantLabel?: string;

  @IsOptional()
  @IsString()
  quantityHint?: string;
}

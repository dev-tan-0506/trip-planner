import { IsNumberString, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTripFundDto {
  @IsNumberString()
  targetAmount!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  momoQrPayload?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  bankQrPayload?: Record<string, unknown>;
}

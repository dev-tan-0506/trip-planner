import { IsIn, IsOptional, IsString } from 'class-validator';

const VAULT_DOCUMENT_KINDS = [
  'ID_CARD',
  'PASSPORT',
  'FLIGHT_TICKET',
  'HOTEL_BOOKING',
  'OTHER',
] as const;

export class UploadVaultDocumentDto {
  @IsString()
  @IsIn(VAULT_DOCUMENT_KINDS)
  documentKind!: (typeof VAULT_DOCUMENT_KINDS)[number];

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  fileDataUrl!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

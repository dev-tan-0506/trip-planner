import { IsIn, IsString } from 'class-validator';

const REVIEWABLE_VAULT_STATUSES = ['READY_FOR_CHECK_IN', 'ARCHIVED'] as const;

export class ReviewVaultDocumentDto {
  @IsString()
  @IsIn(REVIEWABLE_VAULT_STATUSES)
  status!: (typeof REVIEWABLE_VAULT_STATUSES)[number];
}

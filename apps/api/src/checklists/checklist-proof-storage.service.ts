import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class ChecklistProofStorageService {
  private readonly storageDir = join(
    process.cwd(),
    'apps',
    'api',
    'storage',
    'checklist-proofs',
  );

  async saveProofImage(itemId: string, tripMemberId: string, imageDataUrl: string): Promise<string> {
    const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid checklist proof payload');
    }

    const mimeType = match[1];
    const base64Body = match[2];
    const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const fileName = `${itemId}-${tripMemberId}.${extension}`;

    await mkdir(this.storageDir, { recursive: true });
    await writeFile(join(this.storageDir, fileName), Buffer.from(base64Body, 'base64'));

    return `/checklist-proofs/${fileName}`;
  }
}

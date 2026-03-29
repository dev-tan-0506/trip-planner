import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class ProofStorageService {
  private readonly storageDir = join(
    process.cwd(),
    'apps',
    'api',
    'storage',
    'attendance-proofs',
  );

  async saveProofImage(
    sessionId: string,
    tripMemberId: string,
    imageDataUrl: string,
  ): Promise<string> {
    const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid proof image payload');
    }

    const mimeType = match[1];
    const base64Body = match[2];
    const extension = this.getExtensionFromMime(mimeType);
    const fileName = `${sessionId}-${tripMemberId}.${extension}`;

    await mkdir(this.storageDir, { recursive: true });
    await writeFile(join(this.storageDir, fileName), Buffer.from(base64Body, 'base64'));

    return `/attendance-proofs/${fileName}`;
  }

  private getExtensionFromMime(mimeType: string) {
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('webp')) return 'webp';
    return 'jpg';
  }
}

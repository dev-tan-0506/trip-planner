import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type AllowedVaultMime = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

@Injectable()
export class VaultStorageService {
  private readonly apiRoot = process.cwd().endsWith(join('apps', 'api'))
    ? process.cwd()
    : join(process.cwd(), 'apps', 'api');
  private readonly storageDir = join(
    this.apiRoot,
    'storage',
    'memories',
    'vault',
  );

  async saveDocument(
    tripId: string,
    tripMemberId: string,
    fileName: string,
    mimeType: string,
    fileDataUrl: string,
  ): Promise<string> {
    const parsed = this.parsePayload(fileDataUrl);
    if (parsed.mimeType !== mimeType) {
      throw new BadRequestException('MIME type does not match vault payload');
    }

    const extension = this.getExtensionFromMime(parsed.mimeType);
    const safeName = this.slugifyFileName(fileName);
    const finalFileName = `${tripId}-${tripMemberId}-${safeName}.${extension}`;

    await mkdir(this.storageDir, { recursive: true });
    await writeFile(join(this.storageDir, finalFileName), Buffer.from(parsed.base64Body, 'base64'));

    return `/memories/vault/${finalFileName}`;
  }

  private parsePayload(fileDataUrl: string) {
    const imageMatch = fileDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (imageMatch) {
      const mimeType = imageMatch[1] as AllowedVaultMime;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
        throw new BadRequestException('Unsupported image type for vault upload');
      }
      return { mimeType, base64Body: imageMatch[2] };
    }

    const pdfMatch = fileDataUrl.match(/^data:(application\/pdf);base64,(.+)$/);
    if (pdfMatch) {
      return { mimeType: pdfMatch[1] as AllowedVaultMime, base64Body: pdfMatch[2] };
    }

    throw new BadRequestException('Vault upload must be an image or PDF data URL');
  }

  private getExtensionFromMime(mimeType: AllowedVaultMime) {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/webp') return 'webp';
    return 'jpg';
  }

  private slugifyFileName(fileName: string) {
    const normalized = fileName
      .replace(/\.[^/.]+$/, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'vault-document';
  }
}

import { Injectable } from '@angular/core';

const CHUNK_SIZE = 800_000;

@Injectable({ providedIn: 'root' })
export class AudioCompressorService {
  async compressAndSplit(file: File): Promise<{ parts: string[]; total: number; mime: string }> {
    const base64 = await this.blobToBase64(file);
    const mime = file.type || 'audio/mpeg';

    const parts: string[] = [];
    for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
      parts.push(base64.slice(i, i + CHUNK_SIZE));
    }
    return { parts, total: parts.length, mime };
  }

  joinParts(parts: string[]): string {
    return parts.join('');
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.slice(result.indexOf(',') + 1));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

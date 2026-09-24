// Admin image uploads, stored on disk in public/assets/uploads/ (the one
// directory that persists across deploys on the hosting platform).
//
// `next start` only serves files that were in public/ at build time, so
// uploads are served by app/assets/uploads/[file]/route.ts instead, at the
// same /assets/uploads/<name> URL.

import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'uploads');
export const UPLOAD_URL_PREFIX = '/assets/uploads/';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Anything we'll read back from disk must match this — blocks path
// traversal and serving non-image files that happen to be in the folder.
export const UPLOAD_NAME_PATTERN = /^[a-z0-9-]+\.(jpg|png|webp)$/;

type ImageType = { ext: 'jpg' | 'png' | 'webp'; mime: string };

export const MIME_BY_EXT: Record<ImageType['ext'], string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// Identify the image by its magic bytes rather than trusting the
// client-supplied filename or Content-Type.
export function detectImageType(buf: Buffer): ImageType | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: MIME_BY_EXT.jpg };
  }
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: 'png', mime: MIME_BY_EXT.png };
  }
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return { ext: 'webp', mime: MIME_BY_EXT.webp };
  }
  return null;
}

function baseName(originalName: string): string {
  const stem = originalName.replace(/\.[^.]*$/, '');
  return (
    stem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '')
      .slice(0, 40) || 'image'
  );
}

export type UploadedImage = { name: string; url: string; size: number; uploadedAt: string };

export class UploadError extends Error {}

export async function saveUpload(file: File): Promise<UploadedImage> {
  if (file.size === 0) throw new UploadError('The file is empty');
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('Images must be 5 MB or smaller');

  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buf);
  if (!type) throw new UploadError('Only JPG, PNG and WebP images are allowed');

  const name = `${baseName(file.name)}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}.${type.ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  // 'wx' refuses to overwrite, should a name ever collide.
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf, { flag: 'wx' });

  return { name, url: UPLOAD_URL_PREFIX + name, size: buf.length, uploadedAt: new Date().toISOString() };
}

export async function listUploads(): Promise<UploadedImage[]> {
  let names: string[];
  try {
    names = await fs.readdir(UPLOAD_DIR);
  } catch {
    return []; // folder not created yet
  }
  const images = await Promise.all(
    names
      .filter((n) => UPLOAD_NAME_PATTERN.test(n))
      .map(async (name) => {
        const stat = await fs.stat(path.join(UPLOAD_DIR, name));
        return { name, url: UPLOAD_URL_PREFIX + name, size: stat.size, uploadedAt: stat.mtime.toISOString() };
      })
  );
  return images.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function readUpload(name: string): Promise<{ data: Buffer; mime: string } | null> {
  if (!UPLOAD_NAME_PATTERN.test(name)) return null;
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split('.').pop() as ImageType['ext'];
    return { data, mime: MIME_BY_EXT[ext] };
  } catch {
    return null;
  }
}

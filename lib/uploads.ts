// Admin image uploads, stored as blobs in MySQL rather than on disk.
//
// They used to live in public/assets/uploads/, served at runtime by
// app/assets/uploads/[file]/route.ts (since `next start` only serves public/
// files that existed at build time). But GitHub-sync deploys reset the
// app's working tree on each pull, which silently wiped any files that had
// only ever been uploaded to the live server's local disk. The database
// isn't touched by a redeploy, so storing the bytes there instead makes
// uploads durable across deploys.

import { randomBytes } from 'crypto';
import { query } from './db';

export const UPLOAD_URL_PREFIX = '/assets/uploads/';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Blocks path traversal and non-image names.
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

type UploadRow = { name: string; mime: string; size: number; uploaded_at: string };

export async function saveUpload(file: File): Promise<UploadedImage> {
  if (file.size === 0) throw new UploadError('The file is empty');
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('Images must be 5 MB or smaller');

  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buf);
  if (!type) throw new UploadError('Only JPG, PNG and WebP images are allowed');

  const name = `${baseName(file.name)}-${Date.now().toString(36)}${randomBytes(3).toString('hex')}.${type.ext}`;
  await query(
    'INSERT INTO uploads (name, mime, size, data) VALUES (?, ?, ?, ?)',
    [name, type.mime, buf.length, buf]
  );

  return { name, url: UPLOAD_URL_PREFIX + name, size: buf.length, uploadedAt: new Date().toISOString() };
}

export async function listUploads(): Promise<UploadedImage[]> {
  const rows = await query<UploadRow[]>(
    'SELECT name, mime, size, uploaded_at FROM uploads ORDER BY uploaded_at DESC'
  );
  return rows.map((row) => ({
    name: row.name,
    url: UPLOAD_URL_PREFIX + row.name,
    size: row.size,
    uploadedAt: new Date(row.uploaded_at).toISOString(),
  }));
}

export async function readUpload(name: string): Promise<{ data: Buffer; mime: string } | null> {
  if (!UPLOAD_NAME_PATTERN.test(name)) return null;
  const rows = await query<Array<{ data: Buffer; mime: string }>>(
    'SELECT data, mime FROM uploads WHERE name = ?',
    [name]
  );
  return rows[0] ?? null;
}

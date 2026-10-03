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
import sharp from 'sharp';
import { query } from './db';

export const UPLOAD_URL_PREFIX = '/assets/uploads/';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Facebook/Twitter's standard og:image ratio.
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

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

export type UploadedImage = {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  ogUrl: string | null;
};

export class UploadError extends Error {}

type UploadRow = { name: string; mime: string; size: number; uploaded_at: string };

// Derives the social-variant's stored name from the original's, e.g.
// "foo-abc123.jpg" -> "foo-abc123-og.jpg". Deterministic so callers that
// only know the original's URL (e.g. og:image metadata) can look the
// variant up without a schema change linking the two.
function ogName(name: string): string {
  return name.replace(/\.(jpg|png|webp)$/, '-og.jpg');
}

// Share copies made before they were converted to JPEG kept the original's
// extension; still cleaned up on delete.
function legacyOgName(name: string): string {
  return name.replace(/\.(jpg|png|webp)$/, '-og.$1');
}

// Center-crops `buf` to the 1200x630 og:image ratio and re-encodes it as a
// light JPEG (typically 80-150 KB). Link previews need this: WhatsApp drops
// preview images much over ~300 KB and Facebook can time out on heavy ones,
// and a raw PNG screenshot at this size is easily 1-2 MB. A source smaller
// than 1200x630 is scaled up, so every share image has the declared size.
async function makeOgVariant(buf: Buffer): Promise<Buffer | null> {
  const image = sharp(buf).rotate();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) return null;

  return image
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}

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

  let ogUrl: string | null = null;
  try {
    const variant = await makeOgVariant(buf);
    if (variant) {
      const variantName = ogName(name);
      await query(
        'INSERT INTO uploads (name, mime, size, data) VALUES (?, ?, ?, ?)',
        [variantName, MIME_BY_EXT.jpg, variant.length, variant]
      );
      ogUrl = UPLOAD_URL_PREFIX + variantName;
    }
  } catch (err) {
    // The original upload already succeeded; a broken/corrupt image or an
    // unsupported edge case here shouldn't fail the whole upload — og:image
    // metadata falls back to the original when this stays null.
    console.error(`Failed to generate og:image variant for ${name}`, err);
  }

  return {
    name,
    url: UPLOAD_URL_PREFIX + name,
    size: buf.length,
    uploadedAt: new Date().toISOString(),
    ogUrl,
  };
}

// Looks up the -og variant for an upload URL (e.g. from a circular's
// image_url), for use as og:image/twitter:image. Returns null for
// externally-hosted images (AIRF imports etc.) or uploads with no variant
// (skipped as too small, or predating this feature) — callers fall back
// to the original image_url in that case.
export async function resolveOgImageUrl(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl || !imageUrl.startsWith(UPLOAD_URL_PREFIX)) return null;
  const name = imageUrl.slice(UPLOAD_URL_PREFIX.length);
  if (!UPLOAD_NAME_PATTERN.test(name)) return null;

  const variantName = ogName(name);
  const rows = await query<Array<{ name: string }>>(
    'SELECT name FROM uploads WHERE name = ?',
    [variantName]
  );
  if (rows[0]) return UPLOAD_URL_PREFIX + variantName;

  // No light share copy yet (the picture predates this, or an older heavy
  // copy exists): build it once from the original and keep it for next time.
  try {
    const original = await query<Array<{ data: Buffer }>>('SELECT data FROM uploads WHERE name = ?', [name]);
    if (!original[0]) return null;
    const variant = await makeOgVariant(original[0].data);
    if (!variant) return null;
    await query('INSERT IGNORE INTO uploads (name, mime, size, data) VALUES (?, ?, ?, ?)', [
      variantName,
      MIME_BY_EXT.jpg,
      variant.length,
      variant,
    ]);
    return UPLOAD_URL_PREFIX + variantName;
  } catch (err) {
    console.error(`Failed to build share image for ${name}`, err);
    return null;
  }
}

export async function listUploads(): Promise<UploadedImage[]> {
  const rows = await query<UploadRow[]>(
    'SELECT name, mime, size, uploaded_at FROM uploads ORDER BY uploaded_at DESC'
  );
  return rows
    // og:image variants are an internal detail, not a real upload of their
    // own — hide them from the media picker so editors can't select one.
    .filter((row) => !row.name.match(/-og\.(jpg|png|webp)$/))
    .map((row) => ({
      name: row.name,
      url: UPLOAD_URL_PREFIX + row.name,
      size: row.size,
      uploadedAt: new Date(row.uploaded_at).toISOString(),
      ogUrl: null,
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

export type DeleteUploadsResult = {
  deleted: string[];
  // Pictures that were not deleted because a post still uses them.
  blocked: { name: string; posts: { id: number; title: string }[] }[];
};

// Deletes uploaded pictures (and each one's hidden social-sharing copy).
// A picture a post still uses — as its main image, or inside its text, in a
// draft or a published post — is never deleted: it is reported back so the
// editor can change those posts first. Unknown or malformed names are ignored.
export async function deleteUploads(names: string[]): Promise<DeleteUploadsResult> {
  const result: DeleteUploadsResult = { deleted: [], blocked: [] };

  for (const name of Array.from(new Set(names))) {
    if (!UPLOAD_NAME_PATTERN.test(name) || /-og\.(jpg|png|webp)$/.test(name)) continue;
    const url = UPLOAD_URL_PREFIX + name;

    const posts = await query<{ id: number; title: string }[]>(
      'SELECT id, title FROM circulars WHERE image_url = ? OR summary LIKE ?',
      [url, `%${url}%`]
    );
    if (posts.length > 0) {
      result.blocked.push({ name, posts: posts.slice(0, 5) });
      continue;
    }

    const res = await query<{ affectedRows: number }>('DELETE FROM uploads WHERE name IN (?, ?, ?)', [name, ogName(name), legacyOgName(name)]);
    if (res.affectedRows > 0) result.deleted.push(name);
  }
  return result;
}

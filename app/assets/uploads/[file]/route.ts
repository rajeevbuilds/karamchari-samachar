import { readUpload } from '@/lib/uploads';

// Serves admin uploads from public/assets/uploads/. `next start` only serves
// public/ files that existed at build time, so runtime uploads need this.
// Names are unique per upload, so they can be cached forever.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const upload = await readUpload(file);
  if (!upload) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(new Uint8Array(upload.data), {
    headers: {
      'Content-Type': upload.mime,
      'Content-Length': String(upload.data.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

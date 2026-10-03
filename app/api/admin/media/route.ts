import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { deleteUploads, listUploads, saveUpload, UploadError } from '@/lib/uploads';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ uploads: await listUploads() });
  } catch (err) {
    console.error('GET /api/admin/media failed', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Could not list uploads: ${detail}` }, { status: 500 });
  }
}

// multipart/form-data with a single "file" field.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }

  try {
    return NextResponse.json({ upload: await saveUpload(file) }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('POST /api/admin/media failed', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Could not save the upload: ${detail}` }, { status: 500 });
  }
}

// Body: { names: string[] } — upload file names (e.g. "foo-abc123.png").
// Pictures still used by a post are skipped and listed under `blocked`.
export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const names = Array.isArray(body?.names) ? body.names.filter((n: unknown) => typeof n === 'string') : [];
  if (names.length === 0 || names.length > 100) {
    return NextResponse.json({ error: 'Select between 1 and 100 images' }, { status: 400 });
  }

  try {
    return NextResponse.json(await deleteUploads(names));
  } catch (err) {
    console.error('DELETE /api/admin/media failed', err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Could not delete: ${detail}` }, { status: 500 });
  }
}

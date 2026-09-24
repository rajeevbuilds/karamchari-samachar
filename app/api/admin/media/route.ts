import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { listUploads, saveUpload, UploadError } from '@/lib/uploads';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ uploads: await listUploads() });
  } catch (err) {
    console.error('GET /api/admin/media failed', err);
    return NextResponse.json({ error: 'Could not list uploads' }, { status: 500 });
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
    return NextResponse.json({ error: 'Could not save the upload' }, { status: 500 });
  }
}

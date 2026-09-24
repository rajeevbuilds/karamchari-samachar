import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllCircularsAdmin, createCircular } from '@/lib/data';
import { parseCircularInput } from '@/lib/validation';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const circulars = await getAllCircularsAdmin();
    return NextResponse.json({ circulars });
  } catch (err) {
    console.error('GET /api/admin/circulars failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let input;
  try {
    input = parseCircularInput(await request.json());
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    const id = await createCircular(input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/circulars failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

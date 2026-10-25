import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllCircularsAdmin, createCircular, describeDbError } from '@/lib/data';
import { parseCircularInput } from '@/lib/validation';
import { notifyAboutCircular, pushConfigured, countSubscriptions } from '@/lib/push';

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
  let notify = false;
  try {
    const body = await request.json();
    input = parseCircularInput(body);
    notify = body?.notify === true;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    const id = await createCircular(input);
    // Optional "alert my subscribers" step. It runs in the background so saving
    // the post is never slowed down or failed by it.
    let notified = 0;
    if (notify && input.status === 'published' && (await pushConfigured())) {
      notified = await countSubscriptions();
      void notifyAboutCircular(id).catch((err) => console.error('notifyAboutCircular failed', err));
    }
    return NextResponse.json({ id, notified }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/circulars failed', err);
    return NextResponse.json(
      { error: `Database error: ${describeDbError(err)}` },
      { status: 500 }
    );
  }
}

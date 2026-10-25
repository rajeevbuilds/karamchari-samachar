import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { updateCircular, deleteCircular, describeDbError } from '@/lib/data';
import { parseCircularInput } from '@/lib/validation';
import { notifyAboutCircular, pushConfigured, countSubscriptions } from '@/lib/push';
import { applyCpc8Pin } from '@/lib/cpc8Pin';

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) ? n : null;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const circularId = parseId(id);
  if (circularId === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let input;
  let notify = false;
  let pin: boolean | null = null;
  try {
    const body = await request.json();
    input = parseCircularInput(body);
    notify = body?.notify === true;
    pin = typeof body?.pinCpc8 === 'boolean' ? body.pinCpc8 : null;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    await updateCircular(circularId, input);
    await applyCpc8Pin(circularId, pin, input);
    let notified = 0;
    if (notify && input.status === 'published' && (await pushConfigured())) {
      notified = await countSubscriptions();
      void notifyAboutCircular(circularId).catch((err) => console.error('notifyAboutCircular failed', err));
    }
    return NextResponse.json({ ok: true, notified });
  } catch (err) {
    console.error('PUT /api/admin/circulars/[id] failed', err);
    return NextResponse.json(
      { error: `Database error: ${describeDbError(err)}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const circularId = parseId(id);
  if (circularId === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await deleteCircular(circularId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/circulars/[id] failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

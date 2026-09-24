import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { updateDaRecord, deleteDaRecord } from '@/lib/data';
import { parseDaInput } from '@/lib/validation';

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) ? n : null;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const recordId = parseId(id);
  if (recordId === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let input;
  try {
    input = parseDaInput(await request.json());
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    await updateDaRecord(recordId, input);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/da-history/[id] failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
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
  const recordId = parseId(id);
  if (recordId === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await deleteDaRecord(recordId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/da-history/[id] failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

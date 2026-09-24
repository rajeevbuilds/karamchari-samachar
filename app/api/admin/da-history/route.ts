import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllDaHistoryAdmin, createDaRecord } from '@/lib/data';
import { parseDaInput } from '@/lib/validation';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const daHistory = await getAllDaHistoryAdmin();
    return NextResponse.json({ daHistory });
  } catch (err) {
    console.error('GET /api/admin/da-history failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let input;
  try {
    input = parseDaInput(await request.json());
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    const id = await createDaRecord(input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/da-history failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

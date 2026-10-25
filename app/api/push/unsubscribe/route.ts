import { NextRequest, NextResponse } from 'next/server';
import { removeSubscription } from '@/lib/push';
import { describeDbError } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let endpoint = '';
  try {
    const body = (await request.json()) as { endpoint?: unknown };
    endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!endpoint) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  try {
    await removeSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/push/unsubscribe failed —', describeDbError(err));
    return NextResponse.json({ error: 'Could not remove' }, { status: 500 });
  }
}

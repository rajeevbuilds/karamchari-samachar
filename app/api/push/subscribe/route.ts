import { NextRequest, NextResponse } from 'next/server';
import { parseSubscription, pushConfigured, saveSubscription } from '@/lib/push';
import { describeDbError } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await pushConfigured())) return NextResponse.json({ error: 'Notifications are not set up' }, { status: 404 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const sub = parseSubscription(body);
  if (!sub) return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  try {
    await saveSubscription(sub);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('POST /api/push/subscribe failed —', describeDbError(err));
    return NextResponse.json({ error: 'Could not save' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { vapidPublicKey } from '@/lib/push';

export const dynamic = 'force-dynamic';

// The public half of the push key, which the browser needs to subscribe.
// 404 when notifications are not set up, so the site simply hides the button.
export async function GET() {
  const key = await vapidPublicKey();
  if (!key) return NextResponse.json({ error: 'Notifications are not set up' }, { status: 404 });
  return NextResponse.json({ key }, { headers: { 'Cache-Control': 'no-store' } });
}

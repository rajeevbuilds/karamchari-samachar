import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { countSubscriptions, pushConfigured } from '@/lib/push';

export const dynamic = 'force-dynamic';

// Admin-only: is the feature set up, and how many readers have switched alerts on?
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const configured = pushConfigured();
  return NextResponse.json({ configured, subscribers: configured ? await countSubscriptions() : 0 });
}

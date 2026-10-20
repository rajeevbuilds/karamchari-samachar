import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getViewsInRange, getViewsOnDate, rangeStart, todayIst, type ViewsRange } from '@/lib/data';

// Views of every post on one date, for the admin "Post Views" page.
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ?range=7d|1m|3m|6m|1y: the period ending today (Indian time).
  const range = request.nextUrl.searchParams.get('range');
  if (range) {
    if (!['7d', '1m', '3m', '6m', '1y'].includes(range)) {
      return NextResponse.json({ error: 'Unknown period' }, { status: 400 });
    }
    const to = todayIst();
    return NextResponse.json(await getViewsInRange(rangeStart(to, range as ViewsRange), to));
  }
  const date = request.nextUrl.searchParams.get('date') || todayIst();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: 'Enter a valid date' }, { status: 400 });
  }
  return NextResponse.json(await getViewsOnDate(date));
}

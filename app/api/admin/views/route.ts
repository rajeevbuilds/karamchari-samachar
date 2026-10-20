import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getViewsOnDate, todayIst } from '@/lib/data';

// Views of every post on one date, for the admin "Post Views" page.
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const date = request.nextUrl.searchParams.get('date') || todayIst();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: 'Enter a valid date' }, { status: 400 });
  }
  return NextResponse.json(await getViewsOnDate(date));
}

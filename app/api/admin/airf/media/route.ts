import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { searchAirfMedia } from '@/lib/airf';

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const search = (request.nextUrl.searchParams.get('search') ?? '').slice(0, 100);
  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 });
  }

  try {
    return NextResponse.json(await searchAirfMedia(search, page));
  } catch (err) {
    console.error('GET /api/admin/airf/media failed', err);
    return NextResponse.json({ error: 'Could not search airfindia.org media' }, { status: 502 });
  }
}

import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { fetchAirfCategories } from '@/lib/airf';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ categories: await fetchAirfCategories() });
  } catch (err) {
    console.error('GET /api/admin/airf/categories failed', err);
    return NextResponse.json({ error: 'Could not load categories from airfindia.org' }, { status: 502 });
  }
}

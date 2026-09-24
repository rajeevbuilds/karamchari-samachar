import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { fetchAirfPosts } from '@/lib/airf';
import { getExistingPdfUrls } from '@/lib/data';

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categoryId = Number(request.nextUrl.searchParams.get('category'));
  const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
  if (!Number.isInteger(categoryId) || categoryId <= 0 || !Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: 'Invalid category or page' }, { status: 400 });
  }

  let result;
  try {
    result = await fetchAirfPosts(categoryId, page);
  } catch (err) {
    console.error('GET /api/admin/airf/posts failed', err);
    return NextResponse.json({ error: 'Could not load posts from airfindia.org' }, { status: 502 });
  }

  try {
    const imported = await getExistingPdfUrls(result.posts.map((p) => p.link));
    return NextResponse.json({
      posts: result.posts.map((p) => ({ ...p, alreadyImported: imported.has(p.link) })),
      totalPages: result.totalPages,
    });
  } catch (err) {
    console.error('GET /api/admin/airf/posts: database lookup failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

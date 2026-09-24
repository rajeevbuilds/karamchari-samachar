import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { fetchAirfPostsByIds } from '@/lib/airf';
import { createImportedDraft, getExistingPdfUrls } from '@/lib/data';

const MAX_IDS = 50;

// Body: { ids: number[] } — WordPress post ids. Posts are re-fetched from
// airfindia.org here rather than trusting client-supplied titles/URLs.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ids: number[] = Array.isArray(body?.ids)
    ? [...new Set<number>(body.ids.map(Number))].filter((n) => Number.isInteger(n) && n > 0)
    : [];
  if (ids.length === 0 || ids.length > MAX_IDS) {
    return NextResponse.json({ error: `Select between 1 and ${MAX_IDS} posts` }, { status: 400 });
  }

  let posts;
  try {
    posts = await fetchAirfPostsByIds(ids);
  } catch (err) {
    console.error('POST /api/admin/airf/import: fetch failed', err);
    return NextResponse.json({ error: 'Could not load posts from airfindia.org' }, { status: 502 });
  }

  try {
    const existing = await getExistingPdfUrls(posts.map((p) => p.link));
    const imported: { wpId: number; id: number; title: string; imageUrl: string | null }[] = [];
    const skipped: { wpId: number; title: string }[] = [];

    for (const post of posts) {
      if (existing.has(post.link)) {
        skipped.push({ wpId: post.wpId, title: post.title });
        continue;
      }
      const id = await createImportedDraft({
        title: post.title,
        issueDate: post.date,
        summary: post.excerpt || post.title,
        sourceUrl: post.link,
        imageUrl: post.imageUrl,
      });
      imported.push({ wpId: post.wpId, id, title: post.title, imageUrl: post.imageUrl });
    }

    const found = new Set(posts.map((p) => p.wpId));
    const missing = ids.filter((id) => !found.has(id));
    return NextResponse.json({ imported, skipped, missing });
  } catch (err) {
    console.error('POST /api/admin/airf/import: database write failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

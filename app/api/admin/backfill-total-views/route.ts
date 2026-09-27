import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';

// One-off backfill: total_site_views only started counting from the commit
// that introduced it, so it undercounts against circulars.view_count's
// full history. Sets it to the current true sum (single atomic UPDATE, not
// a read-then-write, so it can't race with concurrent increments). Remove
// this route once run and confirmed.
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await query(
      `UPDATE settings SET value = (SELECT SUM(view_count) FROM circulars) WHERE key_name = 'total_site_views'`
    );
    const [row] = await query<Array<{ value: string }>>(
      "SELECT value FROM settings WHERE key_name = 'total_site_views'"
    );
    return NextResponse.json({ ok: true, total_site_views: row?.value ?? null });
  } catch (err) {
    console.error('POST /api/admin/backfill-total-views failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

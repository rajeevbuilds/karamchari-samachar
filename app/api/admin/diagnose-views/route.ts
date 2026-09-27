import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';

// Temporary diagnostic: investigates the total_site_views vs sum(view_count)
// mismatch reported in the admin Overview. Read-only against real data,
// plus one harmless write/read against a throwaway test key to check
// whether CAST(value AS UNSIGNED) on the settings.value TEXT column behaves
// as expected on this MySQL version. Remove once the root cause is fixed.
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settingsRows = await query<
      Array<{ key_name: string; value: string; key_len: number; value_len: number }>
    >(
      'SELECT key_name, value, CHAR_LENGTH(key_name) AS key_len, CHAR_LENGTH(value) AS value_len FROM settings'
    );

    const [circularsAgg] = await query<Array<{ total: string | null; count: number }>>(
      'SELECT SUM(view_count) AS total, COUNT(*) AS count FROM circulars'
    );

    const totalRow = await query<Array<{ value: string }>>(
      "SELECT value FROM settings WHERE key_name = 'total_site_views'"
    );

    // Exercise the exact increment statement against a throwaway key, three
    // times in a row, to see whether CAST(...AS UNSIGNED) itself is the
    // problem (as opposed to something environmental like lock contention).
    const castTest: { step: number; ok: boolean; value?: string; error?: string }[] = [];
    await query("DELETE FROM settings WHERE key_name = '__diag_test__'").catch(() => {});
    for (let i = 0; i < 3; i++) {
      try {
        await query(
          `INSERT INTO settings (key_name, value) VALUES ('__diag_test__', '1')
           ON DUPLICATE KEY UPDATE value = CAST(value AS UNSIGNED) + 1`
        );
        const [row] = await query<Array<{ value: string }>>(
          "SELECT value FROM settings WHERE key_name = '__diag_test__'"
        );
        castTest.push({ step: i + 1, ok: true, value: row?.value });
      } catch (err) {
        castTest.push({ step: i + 1, ok: false, error: err instanceof Error ? err.message : String(err) });
      }
    }
    await query("DELETE FROM settings WHERE key_name = '__diag_test__'").catch(() => {});

    // Also fire 20 concurrent increments at the *real* total_site_views key
    // to check for lock-contention-style failures under concurrency (a
    // single hot row shared by every circular view, unlike per-slug
    // circulars.view_count updates).
    const before = totalRow[0]?.value ?? null;
    const concurrentResults = await Promise.allSettled(
      Array.from({ length: 20 }, () =>
        query(
          `INSERT INTO settings (key_name, value) VALUES ('total_site_views', '1')
           ON DUPLICATE KEY UPDATE value = CAST(value AS UNSIGNED) + 1`
        )
      )
    );
    const concurrentFailures = concurrentResults
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason instanceof Error
        ? (r as PromiseRejectedResult).reason.message
        : String((r as PromiseRejectedResult).reason));
    const afterRow = await query<Array<{ value: string }>>(
      "SELECT value FROM settings WHERE key_name = 'total_site_views'"
    );

    return NextResponse.json({
      settingsRows,
      circularsSum: circularsAgg,
      totalSiteViewsRow: totalRow[0] ?? null,
      castTest,
      concurrencyProbe: {
        before,
        after: afterRow[0]?.value ?? null,
        attempted: 20,
        failed: concurrentFailures.length,
        failureMessages: concurrentFailures,
      },
    });
  } catch (err) {
    console.error('GET /api/admin/diagnose-views failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

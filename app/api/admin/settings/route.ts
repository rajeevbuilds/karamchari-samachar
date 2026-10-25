import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { SETTINGS_KEYS, getAllSettings, setSetting, todayIst, type SettingKey } from '@/lib/data';
import { MAX_SUMMARY_LENGTH, sanitizeTimeline } from '@/lib/cpc8';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ settings: await getAllSettings() });
  } catch (err) {
    console.error('GET /api/admin/settings failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// Body: { key: SettingKey, value: string }
export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const key = body?.key as SettingKey | undefined;
  const value = body?.value;

  if (!key || !SETTINGS_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Unknown setting key' }, { status: 400 });
  }
  if (typeof value !== 'string') {
    return NextResponse.json({ error: 'value must be a string' }, { status: 400 });
  }

  // The 8th Pay Commission page: keep the text short and the table tidy, and
  // stamp the "last updated" date whenever either part is saved.
  let toStore = value;
  if (key === 'cpc8_summary') {
    toStore = value.trim().slice(0, MAX_SUMMARY_LENGTH);
  } else if (key === 'cpc8_timeline') {
    try {
      toStore = JSON.stringify(sanitizeTimeline(JSON.parse(value || '[]')));
    } catch {
      return NextResponse.json({ error: 'Invalid milestone table' }, { status: 400 });
    }
  } else if (key === 'cpc8_pinned_id' && value !== '' && !/^\d{1,9}$/.test(value)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }

  try {
    await setSetting(key, toStore);
    if (key === 'cpc8_summary' || key === 'cpc8_timeline') await setSetting('cpc8_updated', todayIst());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/settings failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { AD_SETTING_KEYS, getAllSettings, setSetting, type AdSettingKey } from '@/lib/data';

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

// Body: { key: 'ad_sidebar_1' | 'ad_sidebar_2' | 'ad_in_article', value: string }
export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const key = body?.key as AdSettingKey | undefined;
  const value = body?.value;

  if (!key || !AD_SETTING_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Unknown setting key' }, { status: 400 });
  }
  if (typeof value !== 'string') {
    return NextResponse.json({ error: 'value must be a string' }, { status: 400 });
  }

  try {
    await setSetting(key, value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/admin/settings failed', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

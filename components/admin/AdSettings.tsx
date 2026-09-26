'use client';

import { useState } from 'react';
import type { AdSettingKey } from '@/lib/data';
import { apiFetch } from './apiFetch';

const FIELDS: { key: AdSettingKey; label: string }[] = [
  { key: 'ad_sidebar_1', label: 'Sidebar slot 1' },
  { key: 'ad_sidebar_2', label: 'Sidebar slot 2' },
  { key: 'ad_in_article', label: 'In-article slot' },
];

// Settings section of the admin panel: raw AdSense embed code per slot,
// rendered on the public circular page by components/AdSlot.tsx.
export default function AdSettings({ initialSettings }: { initialSettings: Record<AdSettingKey, string> }) {
  const [values, setValues] = useState(initialSettings);
  const [savingKey, setSavingKey] = useState<AdSettingKey | null>(null);
  const [savedKey, setSavedKey] = useState<AdSettingKey | null>(null);
  const [errorKey, setErrorKey] = useState<AdSettingKey | null>(null);

  async function save(key: AdSettingKey) {
    setSavingKey(key);
    setErrorKey(null);
    setSavedKey(null);
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] }),
      });
      if (!res.ok) throw new Error();
      setSavedKey(key);
      window.setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 3000);
    } catch {
      setErrorKey(key);
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-ink mb-1">Ad Slots</h2>
      <p className="text-sm text-ink/60 mb-4">
        Paste the raw AdSense embed code (script + ins tags) for each slot. Leave a field empty to show
        the placeholder box on the site instead.
      </p>
      <div className="flex flex-col gap-5">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="border border-rule p-5">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">{label}</label>
            <textarea
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              rows={5}
              placeholder="<script ...></script><ins class=&quot;adsbygoogle&quot; ...></ins>"
              className="w-full border border-rule px-3 py-2 text-xs font-mono focus:outline-none focus:border-maroon"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => save(key)}
                disabled={savingKey === key}
                className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-50"
              >
                {savingKey === key ? 'Saving…' : 'Save'}
              </button>
              {savedKey === key && <span className="text-sm text-leaf">Saved</span>}
              {errorKey === key && <span className="text-sm text-red-600">Could not save — try again</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import type { SettingKey } from '@/lib/data';
import { apiFetch } from './apiFetch';

const FIELDS: { key: SettingKey; label: string; placeholder: string; hint: string }[] = [
  {
    key: 'contact_email',
    label: 'Contact email',
    placeholder: 'name@example.com',
    hint: 'Shown on the Contact Us page as a mail link.',
  },
  {
    key: 'contact_whatsapp',
    label: 'WhatsApp (optional)',
    placeholder: '919876543210  or  https://wa.me/919876543210',
    hint: 'A phone number with country code, or a full WhatsApp link. Leave empty to hide it.',
  },
];

// Contact details for /contact. Stored in the shared settings table (like the
// ad slots) so they can be changed without a redeploy.
export default function ContactSettings({ initialSettings }: { initialSettings: Record<SettingKey, string> }) {
  const [values, setValues] = useState(initialSettings);
  const [savingKey, setSavingKey] = useState<SettingKey | null>(null);
  const [savedKey, setSavedKey] = useState<SettingKey | null>(null);
  const [errorKey, setErrorKey] = useState<SettingKey | null>(null);

  async function save(key: SettingKey) {
    setSavingKey(key);
    setErrorKey(null);
    setSavedKey(null);
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key].trim() }),
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
      <h2 className="font-serif text-xl font-semibold text-ink mb-1">Contact Details</h2>
      <p className="text-sm text-ink/60 mb-4">Shown on the public Contact Us page.</p>
      <div className="flex flex-col gap-5">
        {FIELDS.map(({ key, label, placeholder, hint }) => (
          <div key={key} className="border border-rule p-5 max-w-md">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">{label}</label>
            <input
              type="text"
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
            <p className="text-xs text-ink/50 mt-1">{hint}</p>
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

'use client';

import { useState } from 'react';
import type { SettingKey } from '@/lib/data';
import {
  DEFAULT_CPC8_SUMMARY,
  MAX_MILESTONES,
  MAX_SUMMARY_LENGTH,
  MILESTONE_STATUS_LABEL,
  parseTimeline,
  type Milestone,
  type MilestoneStatus,
} from '@/lib/cpc8';
import { apiFetch } from './apiFetch';

const inputClass = 'w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon';
const labelClass = 'block text-xs font-mono uppercase text-ink/50 mb-1';

// Edits the short summary and the milestone table on the public 8th Pay
// Commission page (/da-cpc-tracker), and shows which post is pinned there.
export default function Cpc8Settings({
  initialSettings,
  pinnedTitle,
}: {
  initialSettings: Record<SettingKey, string>;
  pinnedTitle: string | null;
}) {
  const [summary, setSummary] = useState(initialSettings.cpc8_summary || DEFAULT_CPC8_SUMMARY);
  const [rows, setRows] = useState<Milestone[]>(parseTimeline(initialSettings.cpc8_timeline));
  const [pinned, setPinned] = useState(pinnedTitle);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function update(i: number, patch: Partial<Milestone>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
    setMessage(null);
  }

  async function put(key: SettingKey, value: string) {
    const res = await apiFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error();
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      await put('cpc8_summary', summary);
      await put('cpc8_timeline', JSON.stringify(rows));
      setMessage({ ok: true, text: 'Saved. The 8th Pay Commission page now shows this.' });
    } catch {
      setMessage({ ok: false, text: 'Could not save. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function unpin() {
    try {
      await put('cpc8_pinned_id', '');
      setPinned(null);
    } catch {
      setMessage({ ok: false, text: 'Could not unpin. Please try again.' });
    }
  }

  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-ink mb-1">8th Pay Commission page</h2>
      <p className="text-sm text-ink/60 mb-4 max-w-prose">
        The short summary and milestone table at the top of the public 8th Pay Commission page. Rewrite them when
        something important happens; everyday news is just a normal post with the &ldquo;8th Pay Commission&rdquo;
        section ticked.
      </p>

      <div className="border border-rule p-5 max-w-3xl flex flex-col gap-5">
        <div>
          <label className={labelClass}>Where things stand (keep it to a few lines)</label>
          <textarea
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value.slice(0, MAX_SUMMARY_LENGTH));
              setMessage(null);
            }}
            rows={4}
            className={inputClass}
          />
          <p className="text-xs text-ink/50 mt-1">
            {summary.length} / {MAX_SUMMARY_LENGTH} characters
          </p>
        </div>

        <div>
          <label className={labelClass}>Key milestones (up to {MAX_MILESTONES})</label>
          <div className="flex flex-col gap-3">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[3fr_3fr_9rem_auto] gap-2 items-start">
                <input
                  className={inputClass}
                  placeholder="Milestone"
                  value={row.milestone}
                  onChange={(e) => update(i, { milestone: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="Date (e.g. March 2027)"
                  value={row.date}
                  onChange={(e) => update(i, { date: e.target.value })}
                />
                <select
                  className={inputClass}
                  value={row.status}
                  onChange={(e) => update(i, { status: e.target.value as MilestoneStatus })}
                >
                  {(Object.keys(MILESTONE_STATUS_LABEL) as MilestoneStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {MILESTONE_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setRows((r) => r.filter((_, idx) => idx !== i));
                    setMessage(null);
                  }}
                  className="text-sm text-red-600 hover:underline px-1 py-2"
                  aria-label={`Remove milestone ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {rows.length < MAX_MILESTONES && (
            <button
              type="button"
              onClick={() => setRows((r) => [...r, { milestone: '', date: '', status: 'awaited' }])}
              className="mt-3 text-sm text-maroon hover:underline"
            >
              + Add a milestone
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {message && <span className={`text-sm ${message.ok ? 'text-leaf' : 'text-red-600'}`}>{message.text}</span>}
        </div>

        <div className="border-t border-rule pt-4 text-sm">
          <span className={labelClass}>Pinned post</span>
          {pinned ? (
            <p className="text-ink/80">
              &ldquo;{pinned}&rdquo;{' '}
              <button type="button" onClick={unpin} className="text-maroon hover:underline ml-2">
                Unpin
              </button>
            </p>
          ) : (
            <p className="text-ink/50">None. To pin one, tick &ldquo;Pin this post&rdquo; when you add or edit a post.</p>
          )}
        </div>
      </div>
    </section>
  );
}

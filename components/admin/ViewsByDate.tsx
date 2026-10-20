'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DateInput from '@/components/DateInput';
import { apiFetch } from './apiFetch';

type RangeViews = {
  from: string;
  to: string;
  total: number;
  posts: { id: number; title: string; slug: string; views: number }[];
  firstDate: string | null;
};

const RANGES = [
  { key: '7d', label: 'Last 7 days' },
  { key: '1m', label: '1 month' },
  { key: '3m', label: '3 months' },
  { key: '6m', label: '6 months' },
  { key: '1y', label: '1 year' },
] as const;
type RangeKey = (typeof RANGES)[number]['key'];

type DayViews = {
  date: string;
  total: number;
  posts: { id: number; title: string; slug: string; views: number }[];
  firstDate: string | null;
  last7: { date: string; views: number }[];
};

const ddmm = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};
const short = (iso: string) => ddmm(iso).slice(0, 5);

// Pick a date and see how many views each post had on it. Counting by date
// starts on the day this was added, so earlier dates show nothing.
export default function ViewsByDate({ today }: { today: string }) {
  const [date, setDate] = useState(today);
  const [data, setData] = useState<DayViews | null>(null);
  const [range, setRange] = useState<RangeKey | null>(null); // a period instead of one date
  const [rangeData, setRangeData] = useState<(RangeViews & { key: RangeKey }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!range) return;
    let cancelled = false;
    setError(null);
    apiFetch(`/api/admin/views?range=${range}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Could not load the views');
        if (!cancelled) setRangeData({ ...body, key: range });
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [range]);

  useEffect(() => {
    if (!date || range) return;
    let cancelled = false;
    setError(null);
    apiFetch(`/api/admin/views?date=${date}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Could not load the views');
        if (!cancelled) setData(body);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [date, range]);

  const yesterday = (() => {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const chip = (active: boolean) =>
    `px-3 py-1 text-xs border ${active ? 'bg-ink text-paper border-ink' : 'border-rule text-ink/70 hover:text-maroon'}`;

  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-ink mb-1">Views by date</h2>
      <p className="text-sm text-ink/60 mb-4 max-w-prose">Choose a date to see how many views each post had on that day.</p>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="w-44">
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Date</label>
          <DateInput value={date} onChange={(v) => { setRange(null); setDate(v); }} className="w-full border border-rule px-3 py-2 text-sm bg-white focus:outline-none focus:border-maroon" />
        </div>
        <button type="button" className={chip(!range && date === today)} onClick={() => { setRange(null); setDate(today); }}>Today</button>
        <button type="button" className={chip(!range && date === yesterday)} onClick={() => { setRange(null); setDate(yesterday); }}>Yesterday</button>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-mono uppercase text-ink/50 mr-1">Period</span>
        {RANGES.map((r) => (
          <button key={r.key} type="button" className={chip(range === r.key)} onClick={() => setRange(r.key)} aria-pressed={range === r.key}>
            {r.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {range && rangeData && rangeData.key === range && (
        <>
          <div className="border border-rule px-5 py-4 mb-4 inline-block">
            <div className="text-xs font-mono uppercase text-ink/50 mb-1">
              Total views, {ddmm(rangeData.from)} to {ddmm(rangeData.to)}
            </div>
            <div className="font-serif text-3xl font-semibold text-ink">{rangeData.total.toLocaleString('en-IN')}</div>
          </div>
          {rangeData.firstDate && rangeData.firstDate > rangeData.from && (
            <p className="text-xs text-ink/60 mb-3 max-w-prose">
              Counting by date started on {ddmm(rangeData.firstDate)}, so this total covers {ddmm(rangeData.firstDate)} to {ddmm(rangeData.to)} only. Earlier views are not
              in it.
            </p>
          )}
          {!rangeData.firstDate && (
            <p className="text-xs text-ink/60 mb-3 max-w-prose">Counting by date has just started, so figures appear from the first view after this was added.</p>
          )}
          {rangeData.posts.length > 0 ? (
            <div className="border border-rule overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule text-left">
                    <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 w-10">#</th>
                    <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50">Circular</th>
                    <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {rangeData.posts.map((p, i) => (
                    <tr key={p.id} className="border-b border-rule last:border-b-0">
                      <td className="px-4 py-2 text-ink/50">{i + 1}</td>
                      <td className="px-4 py-2 text-ink">
                        <Link href={`/circulars/${p.slug}`} target="_blank" className="hover:text-maroon transition-colors">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{p.views.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            rangeData.firstDate && <p className="text-sm text-ink/60">No views were recorded in this period.</p>
          )}
        </>
      )}

      {!range && data && data.date === date && (
        <>
          {data.last7.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" aria-label="Views on the 7 days up to the chosen date">
              {data.last7.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setDate(d.date)}
                  className={`border px-3 py-1.5 text-left ${d.date === date ? 'border-maroon bg-maroon/5' : 'border-rule hover:border-maroon'}`}
                >
                  <span className="block font-mono text-[10px] text-ink/50">{short(d.date)}</span>
                  <span className="block font-mono text-sm text-ink">{d.views.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          )}

          <div className="border border-rule px-5 py-4 mb-4 inline-block">
            <div className="text-xs font-mono uppercase text-ink/50 mb-1">Total views on {ddmm(data.date)}</div>
            <div className="font-serif text-3xl font-semibold text-ink">{data.total.toLocaleString('en-IN')}</div>
          </div>

          {data.posts.length > 0 ? (
            <div className="border border-rule overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule text-left">
                    <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 w-10">#</th>
                    <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50">Circular</th>
                    <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.posts.map((p, i) => (
                    <tr key={p.id} className="border-b border-rule last:border-b-0">
                      <td className="px-4 py-2 text-ink/50">{i + 1}</td>
                      <td className="px-4 py-2 text-ink">
                        <Link href={`/circulars/${p.slug}`} target="_blank" className="hover:text-maroon transition-colors">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{p.views.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-ink/60 max-w-prose">
              No views were recorded on {ddmm(data.date)}.{' '}
              {data.firstDate
                ? date < data.firstDate
                  ? `Counting by date started on ${ddmm(data.firstDate)}, so earlier days have no figures.`
                  : ''
                : 'Counting by date has just started, so figures appear from the first view after this was added.'}
            </p>
          )}
        </>
      )}
    </section>
  );
}

import Link from 'next/link';
import type { AdminCircular } from '@/lib/data';

// "2026-10-11 14:30:00" (IST wall-clock) or "2026-10-11" -> DD/MM/YYYY and an
// optional HH:MM, read as text so the browser's timezone cannot shift the day.
function postedParts(c: AdminCircular): { date: string; time: string } {
  const raw = c.postedAt || c.issueDate || '';
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(raw);
  if (!m) return { date: '—', time: '' };
  return { date: `${m[3]}/${m[2]}/${m[1]}`, time: c.postedAt && m[4] ? `${m[4]}:${m[5]}` : '' };
}

function ViewsTable({ rows }: { rows: AdminCircular[] }) {
  return (
    <div className="border border-rule overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule text-left">
            <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 w-10">#</th>
            <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50">Circular</th>
            <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 whitespace-nowrap">Posted</th>
            <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 text-right">Views</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((circular, i) => {
            const { date, time } = postedParts(circular);
            return (
              <tr key={circular.id} className="border-b border-rule last:border-b-0">
                <td className="px-4 py-2 text-ink/50">{i + 1}</td>
                <td className="px-4 py-2 text-ink">
                  <Link href={`/circulars/${circular.slug}`} target="_blank" className="hover:text-maroon transition-colors">
                    {circular.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-ink/70 whitespace-nowrap font-mono text-xs">
                  {date}
                  {time && <span className="block text-ink/40">{time}</span>}
                </td>
                <td className="px-4 py-2 text-ink text-right font-mono">{circular.viewCount.toLocaleString('en-IN')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ViewsOverview({
  totalSiteViews,
  topViewed,
  recent,
}: {
  totalSiteViews: number;
  topViewed: AdminCircular[];
  recent: AdminCircular[];
}) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-ink mb-4">Overview</h2>

      <div className="border border-rule px-5 py-4 mb-6 inline-block">
        <div className="text-xs font-mono uppercase text-ink/50 mb-1">Total site views (all-time)</div>
        <div className="font-serif text-3xl font-semibold text-ink">
          {totalSiteViews.toLocaleString('en-IN')}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="mb-8">
          <h3 className="font-serif text-lg font-semibold text-ink mb-2">Latest 3 posts</h3>
          <ViewsTable rows={recent} />
        </div>
      )}

      {topViewed.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink mb-2">Top 10 most viewed</h3>
          <ViewsTable rows={topViewed} />
        </div>
      )}
    </section>
  );
}

import Link from 'next/link';
import type { AdminCircular } from '@/lib/data';

export default function ViewsOverview({
  totalSiteViews,
  topViewed,
}: {
  totalSiteViews: number;
  topViewed: AdminCircular[];
}) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-ink mb-4">Overview</h2>

      <div className="border border-rule px-5 py-4 mb-4 inline-block">
        <div className="text-xs font-mono uppercase text-ink/50 mb-1">Total site views (all-time)</div>
        <div className="font-serif text-3xl font-semibold text-ink">
          {totalSiteViews.toLocaleString('en-IN')}
        </div>
      </div>

      {topViewed.length > 0 && (
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
              {topViewed.map((circular, i) => (
                <tr key={circular.id} className="border-b border-rule last:border-b-0">
                  <td className="px-4 py-2 text-ink/50">{i + 1}</td>
                  <td className="px-4 py-2 text-ink">
                    <Link
                      href={`/circulars/${circular.slug}`}
                      target="_blank"
                      className="hover:text-maroon transition-colors"
                    >
                      {circular.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink text-right font-mono">
                    {circular.viewCount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

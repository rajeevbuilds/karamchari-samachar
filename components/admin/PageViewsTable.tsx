import Link from 'next/link';
import type { PageViewRow } from '@/lib/data';

// A friendly label for each static page path, so the admin table doesn't
// just show raw URLs. Add an entry here whenever incrementPageView is wired
// into a new static (non-circular) page.
const LABELS: Record<string, string> = {
  '/census-2027': 'Census 2027 — मुख्य पेज',
  '/census-2027/checklist': 'Census 2027 — Checklist',
  '/census-2027/app-guide': 'Census 2027 — App Guide',
  '/census-2027/faq': 'Census 2027 — FAQ',
  '/census-2027/faq-index': 'Census 2027 — FAQ Index',
};

export default function PageViewsTable({ rows }: { rows: PageViewRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-ink mb-4">Other pages</h2>
      <p className="text-sm text-ink/60 mb-3">
        Static guide pages that aren&rsquo;t published as circulars, so they don&rsquo;t appear above.
      </p>
      <div className="border border-rule overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule text-left">
              <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 w-10">#</th>
              <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50">Page</th>
              <th className="px-4 py-2 font-mono text-xs uppercase text-ink/50 text-right">Views</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.path} className="border-b border-rule last:border-b-0">
                <td className="px-4 py-2 text-ink/50">{i + 1}</td>
                <td className="px-4 py-2 text-ink">
                  <Link href={row.path} target="_blank" className="hover:text-maroon transition-colors">
                    {LABELS[row.path] ?? row.path}
                  </Link>
                </td>
                <td className="px-4 py-2 text-ink text-right font-mono">{row.views.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

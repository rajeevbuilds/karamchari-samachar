import CircularGridCard from '@/components/CircularGridCard';
import { getCircularsBySection, getDaHistory } from '@/lib/data';
import { summaryPreviewText } from '@/lib/sanitize';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so newly published content would never appear.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'DA & Pay Commission Tracker — Karamchari Samachar',
};

export default async function DaTrackerPage() {
  const daHistory = await getDaHistory();
  const relatedCirculars = await getCircularsBySection('pay-commission');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">
        Dearness Allowance History
      </h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose">
        DA is revised twice a year, effective January and July, based on the
        All-India Consumer Price Index. Figures below reflect the percentage
        of basic pay.
      </p>

      <table className="w-full text-sm border-t border-rule">
        <thead>
          <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
            <th className="py-2 font-medium">Effective From</th>
            <th className="py-2 font-medium">DA Rate</th>
            <th className="py-2 font-medium">Orders Issued</th>
          </tr>
        </thead>
        <tbody>
          {daHistory.map((record, i) => (
            <tr key={record.effectiveFrom} className="border-b border-rule/60">
              <td className="py-3">
                {new Date(record.effectiveFrom).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </td>
              <td className="py-3 font-serif text-lg text-ink">
                {record.percentage}%
                {i === 0 && (
                  <span className="ml-2 text-xs font-sans text-leaf">current</span>
                )}
              </td>
              <td className="py-3 font-mono text-xs text-ink/60">
                {new Date(record.ordersIssued).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-12 pt-8 border-t border-rule max-w-prose">
        <h2 className="font-serif text-2xl font-semibold text-ink mb-3">
          8th Pay Commission
        </h2>
        <p className="text-sm text-ink/70 leading-relaxed">
          Terms of reference were notified in August 2026, with an 18-month
          window for recommendations. This section will track milestones as
          they're announced — panel formation, submission of the report, and
          cabinet approval.
        </p>
      </section>

      {relatedCirculars.length > 0 && (
        <section className="mt-12 pt-8 border-t border-rule">
          <h2 className="font-serif text-2xl font-semibold text-ink mb-5">Related Circulars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {relatedCirculars.map((circular) => (
              <CircularGridCard
                key={circular.slug}
                circular={{ ...circular, summary: summaryPreviewText(circular.summary) }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

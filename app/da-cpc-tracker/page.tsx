import Link from 'next/link';
import CompactCircularRow from '@/components/CompactCircularRow';
import FaqSection from '@/components/FaqSection';
import FeaturedCircularCard from '@/components/FeaturedCircularCard';
import JsonLd from '@/components/JsonLd';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getAllSettings, getCircularsBySection, getPinnedCpc8Circular } from '@/lib/data';
import { CPC8_FAQS } from '@/lib/faqs';
import { DEFAULT_CPC8_SUMMARY, MILESTONE_STATUS_LABEL, parseTimeline } from '@/lib/cpc8';
import { summaryPreviewText } from '@/lib/sanitize';
import { SITE_URL } from '@/lib/site';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so newly published content would never appear.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '8th Pay Commission: Latest News, Status & Salary Calculator',
  description:
    'Latest news and where things stand on the 8th Pay Commission: milestones, fitment factor, DA, and a free salary calculator for central government employees and pensioners.',
  alternates: { canonical: '/da-cpc-tracker' },
};

const LATEST_COUNT = 6;

const STATUS_STYLE = {
  done: 'text-leaf',
  progress: 'text-brass',
  awaited: 'text-ink/50',
} as const;

function formatUpdated(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return '';
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// The "8th Pay Commission" item in the main menu. A short, always-current status
// page: a summary and a small milestone table (both edited in admin Settings), the
// pinned post, the latest few posts, and common questions. Older news stays in its
// own posts and is reached through "View all", so this page never grows.
export default async function DaTrackerPage() {
  const [sectionCirculars, allCirculars, settings, pinned] = await Promise.all([
    getCircularsBySection('pay-commission'),
    getAllCirculars(),
    getAllSettings(),
    getPinnedCpc8Circular(),
  ]);

  const summary = settings.cpc8_summary || DEFAULT_CPC8_SUMMARY;
  const milestones = parseTimeline(settings.cpc8_timeline);
  const updated = formatUpdated(settings.cpc8_updated);
  const latest = sectionCirculars
    .filter((c) => c.slug !== pinned?.slug)
    .slice(0, LATEST_COUNT)
    .map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }));

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: '8th Pay Commission', item: `${SITE_URL}/da-cpc-tracker` },
          ],
        }}
      />
      <div className="py-10">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">8th Pay Commission: Latest News and Status</h1>
        <p className="text-sm text-ink/60 mb-6">
          8वां वेतन आयोग: ताज़ा खबर और स्थिति, for central government employees and pensioners
        </p>

        <div className="border border-rule p-5 mb-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-2">Where things stand</h2>
          <p className="text-sm text-ink/80 leading-relaxed max-w-prose">{summary}</p>
          {updated && <p className="font-mono text-xs text-ink/50 mt-3">Last updated: {updated}</p>}
        </div>

        <div className="border border-rule p-5 mb-6 overflow-x-auto">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">Key milestones</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                <th className="py-2 pr-3 font-medium">Milestone</th>
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m, i) => (
                <tr key={i} className="border-b border-rule/60 align-top">
                  <td className="py-2 pr-3 text-ink">{m.milestone}</td>
                  <td className="py-2 pr-3 text-ink/70">{m.date || '—'}</td>
                  <td className={`py-2 font-medium whitespace-nowrap ${STATUS_STYLE[m.status]}`}>
                    {MILESTONE_STATUS_LABEL[m.status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-rule p-5 mb-8">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">Check what it could mean for you</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/calculators/8th-pay-commission"
              className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-white hover:opacity-85 transition-opacity"
            >
              8th Pay Commission Salary Calculator
            </Link>
            <Link
              href="/dearness-allowance"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-85 transition-opacity"
            >
              Dearness Allowance (DA)
            </Link>
            <Link
              href="/calculators/nps"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-85 transition-opacity"
            >
              NPS &amp; UPS Calculator
            </Link>
          </div>
        </div>

        {pinned && (
          <div className="mb-8">
            <p className="font-mono text-xs uppercase text-maroon mb-2">Pinned</p>
            <FeaturedCircularCard circular={{ ...pinned, summary: summaryPreviewText(pinned.summary) }} />
          </div>
        )}

        <section>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Latest 8th Pay Commission news</h2>
          {latest.length === 0 ? (
            <p className="text-sm text-ink/50 py-4">No posts yet.</p>
          ) : (
            latest.map((circular) => (
              <div key={circular.slug} className="border-b border-rule last:border-b-0">
                <CompactCircularRow circular={circular} />
              </div>
            ))
          )}
          <Link href="/section/pay-commission" className="inline-block mt-4 text-sm text-maroon hover:underline">
            View all 8th Pay Commission posts →
          </Link>
        </section>

        <FaqSection faqs={CPC8_FAQS} />
      </div>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}

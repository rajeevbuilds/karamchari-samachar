import Image from 'next/image';
import Link from 'next/link';
import CompactCircularRow from '@/components/CompactCircularRow';
import DaArrearsCalc from '@/components/DaArrearsCalc';
import DaQuickCalc from '@/components/DaQuickCalc';
import FaqSection from '@/components/FaqSection';
import JsonLd from '@/components/JsonLd';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getDaHistory, getDefaultDa } from '@/lib/data';
import { DA_FAQS } from '@/lib/faqs';
import { summaryPreviewText } from '@/lib/sanitize';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// The DA figures come from the admin's DA history, so read them on every request.
export const dynamic = 'force-dynamic';

const TITLE = 'Dearness Allowance (DA) for Central Government Employees: Rate & History';
const DESCRIPTION =
  'Current Dearness Allowance (DA) and Dearness Relief (DR) rate for central government employees and pensioners, past DA changes, how DA is calculated, and the latest DA news.';
// Replace this file to change the picture shown at the top and when the page is shared.
const IMAGE = '/share/dearness-allowance.jpg';
const IMAGE_ALT = 'DA arrears calculator on sarkarikaramchari.com';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/dearness-allowance' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    url: '/dearness-allowance',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: IMAGE, width: 1200, height: 630, alt: IMAGE_ALT }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [IMAGE] },
};

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function DearnessAllowancePage() {
  const [history, defaultDa, allCirculars] = await Promise.all([getDaHistory(), getDefaultDa(), getAllCirculars()]);
  const current = history[0];
  const rate = current ? current.percentage : defaultDa.found ? defaultDa.percentage : null;
  const daNews = allCirculars
    .filter((c) => c.category === 'da')
    .slice(0, 6)
    .map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }));

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Dearness Allowance', item: `${SITE_URL}/dearness-allowance` },
          ],
        }}
      />
      <div className="py-10">
        <Image
          src={IMAGE}
          alt={IMAGE_ALT}
          width={1200}
          height={630}
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 880px"
          className="w-full h-auto mb-6 border border-rule"
        />
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">
          Dearness Allowance (DA) for Central Government Employees
        </h1>
        <p className="text-sm text-ink/60 mb-6">महंगाई भत्ता (DA): मौजूदा दर और इतिहास, for employees and pensioners</p>

        <div className="border border-rule p-5 mb-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-2">Current DA / DR rate</h2>
          {rate !== null ? (
            <>
              <p className="font-serif text-4xl font-semibold text-maroon">{rate}%</p>
              <p className="text-sm text-ink/70 mt-2">
                {current ? `In effect from ${formatDate(current.effectiveFrom)}. ` : ''}
                Pensioners get Dearness Relief (DR) at the same rate.
              </p>
            </>
          ) : (
            <p className="text-sm text-ink/60">The current rate will be shown here once it is added.</p>
          )}
        </div>

        <DaQuickCalc defaultRate={rate ?? 0} />
        <DaArrearsCalc
          newRate={rate ?? 0}
          oldRate={history[1] ? history[1].percentage : null}
          from={current ? current.effectiveFrom.slice(0, 7) : '2026-07'}
          to="2026-11"
        />

        <section className="mb-8 text-sm text-ink/80 leading-relaxed max-w-prose">
          <h2 className="font-serif text-lg font-semibold text-ink mb-2">How DA works</h2>
          <p className="mb-3">
            Dearness Allowance is paid on top of basic pay to offset the rise in the cost of living. It is a percentage of
            your Basic Pay, so at a DA rate of 50% an employee with a Basic Pay of ₹40,000 gets ₹20,000 a month as DA.
          </p>
          <p className="mb-3">
            The government revises the rate twice a year, with effect from 1 January and 1 July, based on the All India
            Consumer Price Index for Industrial Workers. The announcement usually comes some weeks after the effective
            date, and the difference is paid as arrears.
          </p>
          <p>
            Pensioners receive Dearness Relief (DR) at the same rate on their basic pension. When a new Pay Commission
            starts, DA has so far begun again from zero, as it did with the 7th Pay Commission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">DA history</h2>
          {history.length === 0 ? (
            <p className="text-sm text-ink/50">The history will be shown here once rates are added.</p>
          ) : (
            <div className="border border-rule overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                    <th className="px-4 py-2 font-medium">With effect from</th>
                    <th className="px-4 py-2 font-medium">DA rate</th>
                    <th className="px-4 py-2 font-medium">Orders issued on</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.effectiveFrom} className="border-b border-rule/60 last:border-b-0">
                      <td className="px-4 py-2">{formatDate(h.effectiveFrom)}</td>
                      <td className="px-4 py-2 font-medium">{h.percentage}%</td>
                      <td className="px-4 py-2 text-ink/70">{h.ordersIssued ? formatDate(h.ordersIssued) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="border border-rule p-5 mb-8">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">Calculators that use DA</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/calculators/8th-pay-commission" className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-white hover:opacity-85 transition-opacity">
              8th Pay Commission Salary Calculator
            </Link>
            <Link href="/calculators/pension-ops" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-85 transition-opacity">
              Pension Calculator
            </Link>
            <Link href="/calculators/gratuity" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:opacity-85 transition-opacity">
              Gratuity Calculator
            </Link>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Latest DA news</h2>
          {daNews.length === 0 ? (
            <p className="text-sm text-ink/50 py-4">No DA posts yet.</p>
          ) : (
            daNews.map((circular) => (
              <div key={circular.slug} className="border-b border-rule last:border-b-0">
                <CompactCircularRow circular={circular} />
              </div>
            ))
          )}
          <Link href="/circulars" className="inline-block mt-4 text-sm text-maroon hover:underline">
            View all circulars →
          </Link>
        </section>

        <FaqSection faqs={DA_FAQS} />
      </div>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}

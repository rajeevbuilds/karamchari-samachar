import { getAllSettings, getLatestDa } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { RETIREMENT_SUMMARY_TOOL } from '@/lib/calculators';
import RetirementSummaryCalculator from '@/components/RetirementSummaryCalculator';

// Reads the latest DA, the pension floor and the gratuity ceiling on every
// request, so admin updates apply without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: RETIREMENT_SUMMARY_TOOL.title,
  alternates: { canonical: RETIREMENT_SUMMARY_TOOL.href },
  description: RETIREMENT_SUMMARY_TOOL.description,
};

export default async function RetirementSummaryPage() {
  const [settings, latestDa] = await Promise.all([getAllSettings(), getLatestDa()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: RETIREMENT_SUMMARY_TOOL.title,
          description: RETIREMENT_SUMMARY_TOOL.description,
          url: `${SITE_URL}${RETIREMENT_SUMMARY_TOOL.href}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        }}
      />
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2 print:hidden">{RETIREMENT_SUMMARY_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose print:hidden">{RETIREMENT_SUMMARY_TOOL.description}</p>
      <RetirementSummaryCalculator
        defaultDaPercent={latestDa.percentage}
        ceiling={Number(settings.gratuity_ceiling) || 0}
        minFloor={Number(settings.pension_min_floor) || 0}
      />
    </div>
  );
}

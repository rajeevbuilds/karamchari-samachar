import { getAllSettings, getDaHistory, getLatestDa } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { RETIREMENT_BENEFITS_TOOL, calculatorMetadata } from '@/lib/calculators';
import RetirementBenefits from '@/components/RetirementBenefits';

// Reads the latest DA, the pension floor and the gratuity ceiling on every
// request, so admin updates apply without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = calculatorMetadata(RETIREMENT_BENEFITS_TOOL);

export default async function RetirementBenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab }, settings, latestDa, daHistory] = await Promise.all([
    searchParams,
    getAllSettings(),
    getLatestDa(),
    getDaHistory(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: RETIREMENT_BENEFITS_TOOL.title,
          description: RETIREMENT_BENEFITS_TOOL.description,
          url: `${SITE_URL}${RETIREMENT_BENEFITS_TOOL.href}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        }}
      />
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2 print:hidden">{RETIREMENT_BENEFITS_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose print:hidden">{RETIREMENT_BENEFITS_TOOL.description}</p>
      <RetirementBenefits
        initialTab={tab === 'check' ? 'check' : 'estimate'}
        daHistory={daHistory.map((d) => ({ effectiveFrom: d.effectiveFrom, percentage: d.percentage }))}
        defaultDaPercent={latestDa.percentage}
        ceiling={Number(settings.gratuity_ceiling) || 0}
        minFloor={Number(settings.pension_min_floor) || 0}
      />
    </div>
  );
}

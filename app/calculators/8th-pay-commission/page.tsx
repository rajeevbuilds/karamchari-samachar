import { getLatestDa } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { EIGHTH_CPC_TOOL, calculatorMetadata } from '@/lib/calculators';
import EighthCpcCalculator from '@/components/EighthCpcCalculator';

// The present DA rate is read from the admin panel on every request.
export const dynamic = 'force-dynamic';

export const metadata = calculatorMetadata(EIGHTH_CPC_TOOL);

export default async function EighthCpcPage() {
  const latestDa = await getLatestDa();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: EIGHTH_CPC_TOOL.title,
          description: EIGHTH_CPC_TOOL.description,
          url: `${SITE_URL}${EIGHTH_CPC_TOOL.href}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        }}
      />
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2 print:hidden">{EIGHTH_CPC_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose print:hidden">{EIGHTH_CPC_TOOL.description}</p>
      <EighthCpcCalculator defaultDaPercent={latestDa.percentage} daOnFile={Boolean(latestDa.effectiveFrom)} />
    </div>
  );
}

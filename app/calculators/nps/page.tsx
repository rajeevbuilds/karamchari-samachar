import { getLatestDa } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { NPS_TOOL } from '@/lib/calculators';
import NpsCalculator from '@/components/NpsCalculator';

// Reads the latest DA rate from the DA history on every request, so the
// prefilled DA follows admin updates without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: NPS_TOOL.title,
  alternates: { canonical: NPS_TOOL.href },
  description: NPS_TOOL.description,
};

export default async function NpsPage() {
  const latestDa = await getLatestDa();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: NPS_TOOL.title,
          description: NPS_TOOL.description,
          url: `${SITE_URL}${NPS_TOOL.href}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        }}
      />
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2 print:hidden">{NPS_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose print:hidden">{NPS_TOOL.description}</p>
      <NpsCalculator defaultDaPercent={latestDa.percentage} />
    </div>
  );
}

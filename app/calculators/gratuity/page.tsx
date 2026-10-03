import { getAllSettings, getLatestDa } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { GRATUITY_TOOL } from '@/lib/calculators';
import GratuityCalculator from '@/components/GratuityCalculator';

// Reads the gratuity ceiling from the settings table and the latest DA rate
// from the DA history on every request, so admin updates take effect
// immediately without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: GRATUITY_TOOL.title,
  alternates: { canonical: GRATUITY_TOOL.href },
  description: GRATUITY_TOOL.description,
};

export default async function GratuityPage() {
  const [settings, latestDa] = await Promise.all([getAllSettings(), getLatestDa()]);
  const ceiling = Number(settings.gratuity_ceiling) || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: GRATUITY_TOOL.title,
          description: GRATUITY_TOOL.description,
          url: `${SITE_URL}${GRATUITY_TOOL.href}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        }}
      />
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{GRATUITY_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose">{GRATUITY_TOOL.description}</p>
      <GratuityCalculator defaultDaPercent={latestDa.percentage} ceiling={ceiling} />
    </div>
  );
}

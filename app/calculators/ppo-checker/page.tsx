import { getAllSettings, getLatestDa } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { PPO_CHECKER_TOOL } from '@/lib/calculators';
import PpoChecker from '@/components/PpoChecker';

// Reads the pension floor, the gratuity ceiling and the latest DA on every
// request, so admin updates apply without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: PPO_CHECKER_TOOL.title,
  alternates: { canonical: PPO_CHECKER_TOOL.href },
  description: PPO_CHECKER_TOOL.description,
};

export default async function PpoCheckerPage() {
  const [settings, latestDa] = await Promise.all([getAllSettings(), getLatestDa()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: PPO_CHECKER_TOOL.title,
          description: PPO_CHECKER_TOOL.description,
          url: `${SITE_URL}${PPO_CHECKER_TOOL.href}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        }}
      />
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2 print:hidden">{PPO_CHECKER_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose print:hidden">{PPO_CHECKER_TOOL.description}</p>
      <PpoChecker
        defaultDaPercent={latestDa.percentage}
        ceiling={Number(settings.gratuity_ceiling) || 0}
        minFloor={Number(settings.pension_min_floor) || 0}
      />
    </div>
  );
}

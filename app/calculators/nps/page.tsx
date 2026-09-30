import { getLatestDa } from '@/lib/data';
import { NPS_TOOL } from '@/lib/calculators';
import NpsCalculator from '@/components/NpsCalculator';

// Reads the latest DA rate from the DA history on every request, so the
// prefilled DA follows admin updates without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${NPS_TOOL.title} — Karamchari Samachar`,
  description: NPS_TOOL.description,
};

export default async function NpsPage() {
  const latestDa = await getLatestDa();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{NPS_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose">{NPS_TOOL.description}</p>
      <NpsCalculator defaultDaPercent={latestDa.percentage} />
    </div>
  );
}

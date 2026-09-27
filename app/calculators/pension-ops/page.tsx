import { getAllSettings } from '@/lib/data';
import { PENSION_OPS_TOOL } from '@/lib/calculators';
import PensionOpsCalculator from '@/components/PensionOpsCalculator';

// Reads DR%/floor from the settings table on every request, so an admin
// updating them (e.g. the twice-yearly DR revision) takes effect
// immediately without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${PENSION_OPS_TOOL.title} — Karamchari Samachar`,
  description: PENSION_OPS_TOOL.description,
};

export default async function PensionOpsPage() {
  const settings = await getAllSettings();
  const defaultDrPercent = Number(settings.pension_default_dr_percent) || 0;
  const minFloor = Number(settings.pension_min_floor) || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{PENSION_OPS_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose">{PENSION_OPS_TOOL.description}</p>
      <PensionOpsCalculator defaultDrPercent={defaultDrPercent} minFloor={minFloor} />
    </div>
  );
}

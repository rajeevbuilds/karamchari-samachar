import CircularsShowcase from '@/components/CircularsShowcase';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getCircularsBySection } from '@/lib/data';
import { summaryPreviewText } from '@/lib/sanitize';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so newly published content would never appear.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '8th Pay Commission — Karamchari Samachar',
};

// The "8th Pay Commission" item in the main menu. Same layout as every
// /section/[slug] page (heading + lead post + compact lists + sidebar), with
// a short status note on top. The DA history table that used to live here was
// removed; DA records are still kept in the admin panel (they supply the
// calculators' default DA rate).
export default async function DaTrackerPage() {
  const [sectionCirculars, allCirculars] = await Promise.all([
    getCircularsBySection('pay-commission'),
    getAllCirculars(),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div>
        <div className="border border-rule p-5 mt-8 -mb-2">
          <h2 className="font-serif text-lg font-semibold text-ink mb-2">Where things stand</h2>
          <p className="text-sm text-ink/70 leading-relaxed max-w-prose">
            Terms of reference were notified in August 2026, with an 18-month window for recommendations. This
            page tracks milestones as they&apos;re announced — panel formation, submission of the report, and
            cabinet approval.
          </p>
        </div>
        <CircularsShowcase
          circulars={sectionCirculars.map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }))}
          heading="8th Pay Commission"
        />
      </div>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}

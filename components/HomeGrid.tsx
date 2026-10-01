import type { Circular } from '@/lib/data';
import CircularsShowcase, { HOME_LATEST_COUNT } from './CircularsShowcase';
import HomeSectionBlock from './HomeSectionBlock';
import SidebarWidgets from './SidebarWidgets';

const SECTION_BLOCK_SIZE = 6; // 1 lead + 1 under it + 4 on the right

// Newest posts filed under `sectionSlug`. Posts already shown in "Latest
// Circulars" are left out so the page doesn't repeat itself — unless that
// would leave the block short, in which case they top it up.
function sectionPicks(circulars: Circular[], sectionSlug: string, alreadyShown: Set<string>): Circular[] {
  const inSection = circulars.filter((c) => c.sections.includes(sectionSlug));
  const fresh = inSection.filter((c) => !alreadyShown.has(c.slug));
  const repeats = inSection.filter((c) => alreadyShown.has(c.slug));
  const chosen = new Set([...fresh, ...repeats].slice(0, SECTION_BLOCK_SIZE).map((c) => c.slug));
  // Back in the original newest-first order, so the lead is the newest pick.
  return inSection.filter((c) => chosen.has(c.slug));
}

export default function HomeGrid({ circulars }: { circulars: Circular[] }) {
  const shownAbove = new Set(circulars.slice(0, HOME_LATEST_COUNT).map((c) => c.slug));

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div>
        <CircularsShowcase circulars={circulars} heading="Latest Circulars" viewAllHref="/circulars" />
        <HomeSectionBlock
          heading="Indian Railways"
          href="/section/railway-board"
          circulars={sectionPicks(circulars, 'railway-board', shownAbove)}
        />
      </div>
      <SidebarWidgets circulars={circulars} />
    </div>
  );
}

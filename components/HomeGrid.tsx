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

// Section blocks shown under "Latest Circulars", in order. To add another,
// add a line here: `slug` is the section's value in lib/constants.ts and
// `href` is where its "More" link goes.
const SECTION_BLOCKS = [
  { heading: '8th Pay Commission', slug: 'pay-commission', href: '/section/pay-commission' },
  { heading: 'Indian Railways', slug: 'railway-board', href: '/section/railway-board' },
];

export default function HomeGrid({ circulars }: { circulars: Circular[] }) {
  // Posts already on screen, so no post appears in two blocks (while a block
  // has other posts to show instead).
  const shown = new Set(circulars.slice(0, HOME_LATEST_COUNT).map((c) => c.slug));
  const blocks = SECTION_BLOCKS.map((block) => {
    const picks = sectionPicks(circulars, block.slug, shown);
    picks.forEach((c) => shown.add(c.slug));
    return { ...block, picks };
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div>
        <CircularsShowcase circulars={circulars} heading="Latest Circulars" viewAllHref="/circulars" />
        {blocks.map((block) => (
          <HomeSectionBlock key={block.slug} heading={block.heading} href={block.href} circulars={block.picks} />
        ))}
      </div>
      <SidebarWidgets circulars={circulars} />
    </div>
  );
}

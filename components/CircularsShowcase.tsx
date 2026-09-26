import Link from 'next/link';
import type { Circular } from '@/lib/data';
import CompactCircularRow from './CompactCircularRow';
import FeaturedCircularCard from './FeaturedCircularCard';

// Hero + dense compact-row layout for a list of circulars: the most recent
// as a FeaturedCircularCard, the next 3 stacked below it (left column), and
// the following 6 as an independent stacked list (right column). Shared by
// the homepage ("Latest Circulars") and /section/[slug] (the section's
// label, no "View all" link since that page already shows everything).
export default function CircularsShowcase({
  circulars,
  heading,
  viewAllHref,
}: {
  circulars: Circular[];
  heading: string;
  viewAllHref?: string;
}) {
  const latest10 = circulars.slice(0, 10);
  const [featured, ...rest] = latest10;
  const leftRest = rest.slice(0, 3);
  const rightList = rest.slice(3, 9);

  return (
    <section className="py-10">
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-4">
        <h2 className="font-serif text-2xl font-semibold text-ink">{heading}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm text-maroon hover:underline">
            View all
          </Link>
        )}
      </div>

      {latest10.length === 0 && <p className="text-sm text-ink/50">No circulars yet.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-x-8">
        {/* Left: hero + next 3, stacked */}
        <div>
          {featured && (
            <div className="mb-5">
              <FeaturedCircularCard circular={featured} />
            </div>
          )}
          {leftRest.map((circular) => (
            <div key={circular.slug} className="border-b border-rule last:border-b-0">
              <CompactCircularRow circular={circular} />
            </div>
          ))}
        </div>

        {/* Right: next 6, independent stacked list */}
        <div className="mt-5 lg:mt-0 lg:border-l border-rule lg:pl-8">
          {rightList.map((circular) => (
            <div key={circular.slug} className="border-b border-rule last:border-b-0">
              <CompactCircularRow circular={circular} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import type { Circular } from '@/lib/data';
import CircularThumb, { formatDate } from './CircularThumb';
import CategoryFeed from './CategoryFeed';

// News-site style category layout: big heading, a featured block (lead
// story plus up to four side stories), then a paginated feed of the rest.
// `circulars` must already be ordered most-recent-first.
export default function CategoryPage({
  title,
  circulars,
}: {
  title: string;
  circulars: Circular[];
}) {
  const [lead, ...others] = circulars;
  const side = others.slice(0, 4);
  const feed = others.slice(4);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-8 pb-14">
      <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink tracking-tight pb-4 border-b-2 border-ink">
        {title}
      </h1>

      {!lead ? (
        <p className="text-sm text-ink/60 py-10">No circulars under {title} yet.</p>
      ) : (
        <>
          <section
            className={`grid gap-8 py-8 border-b border-rule ${
              side.length > 0 ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : ''
            }`}
          >
            <LeadStory circular={lead} label={title} wide={side.length === 0} />
            {side.length > 0 && (
              <div className="flex flex-col divide-y divide-rule lg:border-l lg:border-rule lg:pl-8">
                {side.map((circular) => (
                  <SideStory key={circular.slug} circular={circular} label={title} />
                ))}
              </div>
            )}
          </section>

          {feed.length > 0 && <CategoryFeed circulars={feed} label={title} />}
        </>
      )}
    </div>
  );
}

// With no side stories the lead gets the full width, so lay it out
// image-left/text-right instead of stacking.
function LeadStory({
  circular,
  label,
  wide,
}: {
  circular: Circular;
  label: string;
  wide: boolean;
}) {
  return (
    <Link
      href={`/circulars/${circular.slug}`}
      className={`group grid gap-5 ${wide ? 'md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center' : ''}`}
    >
      <CircularThumb circular={circular} label={label} sizes="(max-width: 1024px) 100vw, 780px" />
      <div className="min-w-0">
        <span className="font-mono text-[11px] uppercase tracking-wide text-maroon">
          {circular.department}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink leading-tight mt-1.5 group-hover:text-maroon transition-colors">
          {circular.title}
        </h2>
        <p className="text-[15px] text-ink/70 leading-relaxed mt-3 line-clamp-3">
          {circular.summary}
        </p>
        <p className="font-mono text-[11px] text-ink/50 mt-3">{formatDate(circular.issueDate)}</p>
      </div>
    </Link>
  );
}

function SideStory({ circular, label }: { circular: Circular; label: string }) {
  return (
    <Link
      href={`/circulars/${circular.slug}`}
      className="group grid grid-cols-[120px_minmax(0,1fr)] gap-3 py-4 first:pt-0 last:pb-0"
    >
      <CircularThumb circular={circular} label={label} sizes="120px" compact />
      <div className="min-w-0">
        <h3 className="font-serif text-[15px] font-semibold text-ink leading-snug line-clamp-3 group-hover:text-maroon transition-colors">
          {circular.title}
        </h3>
        <p className="font-mono text-[11px] text-ink/50 mt-1">{formatDate(circular.issueDate)}</p>
      </div>
    </Link>
  );
}

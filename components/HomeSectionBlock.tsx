import Link from 'next/link';
import Image from 'next/image';
import type { Circular } from '@/lib/data';
import CompactCircularRow from './CompactCircularRow';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// A news-portal style section block for the homepage: a ruled heading with a
// "More" link, one large lead story (title written over its picture), one
// smaller story under it and a list of four on the right. `circulars` are the
// posts to show, newest first — the lead is the first, so six fill the block.
// Homepage-only; section pages keep using CircularsShowcase.
export default function HomeSectionBlock({
  heading,
  href,
  circulars,
}: {
  heading: string;
  href: string;
  circulars: Circular[];
}) {
  if (circulars.length === 0) return null;
  const [lead, second, ...rest] = circulars;
  const right = rest.slice(0, 4);

  return (
    <section className="pb-10">
      <div className="flex items-center gap-3 mb-5">
        <span className="block w-1.5 h-7 bg-maroon" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-ink">{heading}</h2>
        <span className="flex-1 border-t border-maroon/50" aria-hidden="true" />
        <Link href={href} className="text-sm font-medium text-maroon hover:underline whitespace-nowrap">
          More ›
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-x-8">
        <div>
          <Link
            href={`/circulars/${lead.slug}`}
            className="group relative block w-full aspect-[16/10] overflow-hidden bg-ink"
          >
            {lead.imageUrl && (
              <Image
                src={lead.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 520px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-white leading-snug line-clamp-3 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                {lead.title}
              </h3>
              <span className="font-mono text-[11px] text-white/70 mt-1.5 block">{formatDate(lead.issueDate)}</span>
            </div>
          </Link>
          {second && (
            <div className="border-b border-rule lg:border-b-0">
              <CompactCircularRow circular={second} />
            </div>
          )}
        </div>

        {right.length > 0 && (
          <div className="mt-2 lg:mt-0 lg:border-l border-rule lg:pl-8">
            {right.map((circular) => (
              <div key={circular.slug} className="border-b border-rule last:border-b-0">
                <CompactCircularRow circular={circular} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

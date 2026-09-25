import Link from 'next/link';
import Image from 'next/image';
import type { Circular } from '@/lib/data';

const CATEGORY_LABEL: Record<Circular['category'], string> = {
  da: 'Dearness Allowance',
  pay: 'Pay Commission',
  transfer: 'Transfer & Posting',
  recruitment: 'Recruitment',
  pension: 'Pension & Medical',
  general: 'General',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Homepage-only hero card for the single most recent circular. Bigger image,
// bigger headline, more of the teaser than the grid card shows — everything
// else (section/state/circulars pages) keeps using CircularGridCard.
// `circular.summary` is expected to already be a short plain-text teaser
// (see lib/sanitize.ts summaryPreviewText).
export default function FeaturedCircularCard({ circular }: { circular: Circular }) {
  return (
    <Link
      href={`/circulars/${circular.slug}`}
      className="group block border border-rule hover:border-maroon transition-colors"
    >
      {circular.imageUrl && (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-rule/20">
          <Image
            src={circular.imageUrl}
            alt={circular.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 780px"
            priority
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="font-mono text-xs uppercase tracking-wide text-maroon">
            {CATEGORY_LABEL[circular.category]}
          </span>
          <span className="font-mono text-xs text-ink/50">{formatDate(circular.issueDate)}</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mt-2 leading-tight group-hover:text-maroon transition-colors">
          {circular.title}
        </h2>
        <p className="text-sm text-ink/70 mt-3 leading-relaxed line-clamp-3">{circular.summary}</p>
      </div>
    </Link>
  );
}

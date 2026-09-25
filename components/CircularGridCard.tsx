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

// Shared list card: thumbnail, category, title, short teaser, date. Used by
// every circular listing context (homepage, /section/[slug], /states/[state],
// /circulars) so they all render identically. `circular.summary` is expected
// to already be a short plain-text teaser (see lib/sanitize.ts
// summaryPreviewText) — this component just renders it, since it's imported
// into HomeGrid, a client component, and can't pull in server-only
// sanitize-html itself.
export default function CircularGridCard({ circular }: { circular: Circular }) {
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
            sizes="(max-width: 640px) 100vw, 400px"
          />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-wide text-maroon">
            {CATEGORY_LABEL[circular.category]}
          </span>
          <span className="font-mono text-[11px] text-ink/50">{formatDate(circular.issueDate)}</span>
        </div>
        <h3 className="font-serif text-base font-semibold text-ink mt-1 leading-snug line-clamp-2 group-hover:text-maroon transition-colors">
          {circular.title}
        </h3>
        <p className="text-xs text-ink/70 mt-1.5 leading-relaxed line-clamp-2">
          {circular.summary}
        </p>
      </div>
    </Link>
  );
}

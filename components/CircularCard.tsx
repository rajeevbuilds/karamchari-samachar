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

export default function CircularCard({ circular }: { circular: Circular }) {
  return (
    <article className="border-l-2 border-maroon pl-4 py-1">
      {circular.imageUrl && (
        <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden bg-rule/20">
          <Image
            src={circular.imageUrl}
            alt={circular.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <span className="font-mono text-xs uppercase tracking-wide text-maroon">
          {CATEGORY_LABEL[circular.category]}
        </span>
        <span className="font-mono text-xs text-ink/50">
          {formatDate(circular.issueDate)}
        </span>
      </div>
      <h3 className="font-serif text-lg font-semibold text-ink mt-1">
        <Link href={`/circulars/${circular.slug}`} className="hover:text-maroon transition-colors">
          {circular.title}
        </Link>
      </h3>
      <p className="text-sm text-ink/70 mt-1.5 leading-relaxed">{circular.summary}</p>
      <div className="mt-2 flex items-center gap-4 text-xs text-ink/50 font-mono">
        <span>{circular.department}</span>
      </div>
    </article>
  );
}

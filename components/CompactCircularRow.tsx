import Link from 'next/link';
import Image from 'next/image';
import type { Circular } from '@/lib/data';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Dense "thumbnail + headline + date" row for the homepage's secondary
// stories — packs many more circulars per screen than CircularGridCard's
// full-width 16:9 image + teaser, the way a news portal's homepage lists
// its non-lead stories. Homepage-only; every listing page keeps using
// CircularGridCard.
export default function CompactCircularRow({ circular }: { circular: Circular }) {
  return (
    <Link href={`/circulars/${circular.slug}`} className="group flex items-start gap-3 py-2.5">
      {circular.imageUrl && (
        <div className="relative w-28 aspect-[4/3] shrink-0 overflow-hidden bg-rule/20">
          <Image src={circular.imageUrl} alt="" fill className="object-cover" sizes="112px" />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-serif text-sm font-semibold text-ink leading-snug line-clamp-2 group-hover:text-maroon transition-colors">
          {circular.title}
        </h3>
        <span className="font-mono text-[11px] text-ink/50 mt-1 block">
          {formatDate(circular.issueDate)}
        </span>
      </div>
    </Link>
  );
}

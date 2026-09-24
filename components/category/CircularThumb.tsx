import Image from 'next/image';
import type { Circular } from '@/lib/data';

// 16:9 thumbnail for category pages. Many circulars have no image, so
// those get a branded tile instead of leaving a hole in the layout;
// `compact` trims that tile to a single short label for small thumbnails.
export default function CircularThumb({
  circular,
  label,
  sizes,
  compact = false,
}: {
  circular: Circular;
  label: string;
  sizes: string;
  compact?: boolean;
}) {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-ink">
      {circular.imageUrl ? (
        <Image
          src={circular.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes={sizes}
        />
      ) : compact ? (
        <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-br from-ink to-maroon">
          <span className="font-mono text-[9px] uppercase tracking-wider text-brass leading-tight line-clamp-2">
            {label}
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 bg-gradient-to-br from-ink to-maroon">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brass truncate">
            {circular.department || 'Circular'}
          </span>
          <span className="font-serif text-sm sm:text-base leading-tight text-paper/90 mt-0.5 line-clamp-2">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Circular } from '@/lib/data';
import CircularThumb, { formatDate } from './CircularThumb';

const PAGE_SIZE = 10;

// The "content feed" under the featured block: thumbnail left, text right,
// revealed PAGE_SIZE items at a time via "Show more".
export default function CategoryFeed({
  circulars,
  label,
}: {
  circulars: Circular[];
  label: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  return (
    <section className="pt-2">
      <ul>
        {circulars.slice(0, visible).map((circular) => (
          <li key={circular.slug} className="border-b border-rule">
            <Link
              href={`/circulars/${circular.slug}`}
              className="group grid grid-cols-[120px_minmax(0,1fr)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 sm:gap-6 py-6"
            >
              <div>
                <div className="sm:hidden">
                  <CircularThumb circular={circular} label={label} sizes="120px" compact />
                </div>
                <div className="hidden sm:block">
                  <CircularThumb circular={circular} label={label} sizes="400px" />
                </div>
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] uppercase tracking-wide text-maroon">
                  {circular.department}
                </span>
                <h2 className="font-serif text-base sm:text-xl font-semibold text-ink leading-snug mt-1 line-clamp-3 group-hover:text-maroon transition-colors">
                  {circular.title}
                </h2>
                <p className="hidden sm:block text-sm text-ink/70 leading-relaxed mt-2 line-clamp-3">
                  {circular.summary}
                </p>
                <p className="font-mono text-[11px] text-ink/50 mt-2">
                  {formatDate(circular.issueDate)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {visible < circulars.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-8 w-full border border-ink py-3 text-sm font-medium text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          Show more
        </button>
      )}
    </section>
  );
}

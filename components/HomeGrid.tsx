'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Circular } from '@/lib/data';
import CircularGridCard from './CircularGridCard';
import FeaturedCircularCard from './FeaturedCircularCard';

// "Must Read" sidebar item: small thumbnail + title only.
function MustReadItem({ circular }: { circular: Circular }) {
  return (
    <Link href={`/circulars/${circular.slug}`} className="group flex items-start gap-3">
      {circular.imageUrl && (
        <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-rule/20">
          <Image src={circular.imageUrl} alt="" fill className="object-cover" sizes="64px" />
        </div>
      )}
      <h3 className="font-serif text-sm font-semibold text-ink leading-snug group-hover:text-maroon transition-colors">
        {circular.title}
      </h3>
    </Link>
  );
}

export default function HomeGrid({ circulars }: { circulars: Circular[] }) {
  // circulars is already ordered most-recent-first.
  const latest10 = circulars.slice(0, 10);
  const [featured, ...rest] = latest10;

  const mustRead = useMemo(() => circulars.filter((c) => c.isFeatured).slice(0, 4), [circulars]);

  const mostPopular = useMemo(
    () => [...circulars].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8),
    [circulars]
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      {/* Main column */}
      <div>
        <section className="py-10">
          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-4">
            <h2 className="font-serif text-2xl font-semibold text-ink">Latest Circulars</h2>
            <Link href="/circulars" className="text-sm text-maroon hover:underline">
              View all
            </Link>
          </div>

          {featured && (
            <div className="mb-5">
              <FeaturedCircularCard circular={featured} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rest.map((circular) => (
              <CircularGridCard key={circular.slug} circular={circular} />
            ))}
            {latest10.length === 0 && (
              <p className="text-sm text-ink/50 sm:col-span-2">No circulars yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Right rail — widgets */}
      <aside className="py-10 lg:border-l border-rule lg:pl-8 flex flex-col gap-8">
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">Must Read</h2>
          {mustRead.length === 0 ? (
            <p className="text-[13px] text-ink/50">Nothing featured yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {mustRead.map((circular) => (
                <MustReadItem key={circular.slug} circular={circular} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-rule pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-3">Most Popular</h2>
          {mostPopular.length === 0 ? (
            <p className="text-[13px] text-ink/50">No views recorded yet.</p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {mostPopular.map((circular, i) => (
                <li key={circular.slug} className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-maroon/70 shrink-0 w-4">{i + 1}</span>
                  <Link
                    href={`/circulars/${circular.slug}`}
                    className="text-sm text-ink leading-snug hover:text-maroon transition-colors"
                  >
                    {circular.title}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="border-t border-rule pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-2">Filter by Your State</h2>
          <p className="text-[13px] text-ink/70 mb-3 leading-relaxed">
            Central circulars apply everywhere. Select your state to see orders specific to your department.
          </p>
          <Link
            href="/states/punjab"
            className="inline-block text-[13px] font-medium text-paper bg-ink px-3.5 py-2 hover:bg-maroon transition-colors"
          >
            Browse by state →
          </Link>
        </div>
        <div className="border-t border-rule pt-6">
          <p className="font-mono text-xs uppercase tracking-wide text-maroon mb-2">
            8th Pay Commission
          </p>
          <p className="text-[13px] text-ink/70 leading-relaxed">
            Terms of reference notified Aug 2026. 18-month window for recommendations.
          </p>
        </div>
      </aside>
    </div>
  );
}

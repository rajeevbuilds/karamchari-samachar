'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Circular } from '@/lib/data';

const CATEGORIES: { key: 'all' | Circular['category']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'da', label: 'Dearness Allowance' },
  { key: 'pay', label: 'Pay Commission' },
  { key: 'transfer', label: 'Transfer & Posting' },
  { key: 'recruitment', label: 'Recruitment' },
  { key: 'pension', label: 'Pension & Medical' },
];

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

// Main-grid item: thumbnail, category, title, 2-line summary, date.
function GridCard({ circular }: { circular: Circular }) {
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

export default function HomeGrid({
  circulars,
  daPercentage,
  previousDaPercentage,
  daEffectiveFrom,
}: {
  circulars: Circular[];
  daPercentage: number;
  previousDaPercentage: number;
  daEffectiveFrom: string;
}) {
  const [category, setCategory] = useState<'all' | Circular['category']>('all');

  const filtered = useMemo(
    () => (category === 'all' ? circulars : circulars.filter((c) => c.category === category)),
    [category, circulars]
  );
  const latest10 = filtered.slice(0, 10);

  // circulars is already ordered most-recent-first, so filtering preserves
  // that order — no separate sort needed.
  const mustRead = useMemo(() => circulars.filter((c) => c.isFeatured).slice(0, 4), [circulars]);

  const mostPopular = useMemo(
    () => [...circulars].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8),
    [circulars]
  );

  const change = daPercentage - previousDaPercentage;

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      {/* Main column */}
      <div>
        <section className="py-10 border-b border-rule">
          <p className="font-mono text-xs uppercase tracking-wide text-maroon mb-3">
            Latest Dearness Allowance
          </p>
          <div className="flex items-end gap-6 flex-wrap">
            <span className="font-serif text-[clamp(56px,8vw,88px)] font-semibold text-ink leading-none">
              {daPercentage}%
            </span>
            <div className="pb-2">
              <p className="text-leaf font-medium">
                Up {change} points from {previousDaPercentage}%
              </p>
              <p className="text-sm text-ink/60 mt-0.5">
                Effective{' '}
                {new Date(daEffectiveFrom).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <Link
            href="/da-cpc-tracker"
            className="inline-block mt-5 text-sm text-maroon border-b border-maroon/40 hover:border-maroon transition-colors"
          >
            See full DA history and pay commission tracker
          </Link>
        </section>

        <section className="py-10">
          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-4">
            <h2 className="font-serif text-2xl font-semibold text-ink">Latest Circulars</h2>
            <Link href="/circulars" className="text-sm text-maroon hover:underline">
              View all
            </Link>
          </div>

          {/* Category filter — horizontal scrollable strip */}
          <div className="flex flex-row gap-1 overflow-x-auto pb-2 -mx-4 px-4 mb-6">
            {CATEGORIES.map((cat) => {
              const active = category === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`shrink-0 font-mono text-xs uppercase tracking-wide px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-maroon text-maroon'
                      : 'border-transparent text-ink/70 hover:text-maroon'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {latest10.map((circular) => (
              <GridCard key={circular.slug} circular={circular} />
            ))}
            {latest10.length === 0 && (
              <p className="text-sm text-ink/50 sm:col-span-2">No circulars in this category yet.</p>
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

import type { ReactNode } from 'react';

// Shared shell for the plain-text information pages (About, Contact, Privacy
// Policy, Disclaimer, Terms): a title, an optional "last updated" line and
// readable body text with section headings.
export default function InfoPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <article className="max-w-prose">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{title}</h1>
        {updated && <p className="font-mono text-xs text-ink/50 mb-6">Last updated: {updated}</p>}
        <div
          className={[
            'text-sm text-ink/80 leading-relaxed',
            '[&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-2',
            '[&_p]:mb-4',
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1.5',
            '[&_a]:text-maroon [&_a]:underline',
            '[&_strong]:text-ink',
          ].join(' ')}
        >
          {children}
        </div>
      </article>
    </div>
  );
}

import { notFound } from 'next/navigation';
import CircularCard from '@/components/CircularCard';
import { getCircularsBySection } from '@/lib/data';
import { SECTION_OPTIONS } from '@/lib/constants';

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = SECTION_OPTIONS.find((s) => s.value === slug);
  if (!section) notFound();

  const circulars = await getCircularsBySection(slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-1">{section.label}</h1>
      <p className="text-sm text-ink/60 mb-8">Notifications filed under {section.label}</p>

      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-rule">
        {SECTION_OPTIONS.map((s) => (
          <a
            key={s.value}
            href={`/section/${s.value}`}
            className={`text-xs font-mono px-2.5 py-1 border ${
              s.value === slug
                ? 'bg-ink text-paper border-ink'
                : 'border-rule text-ink/60 hover:border-maroon hover:text-maroon'
            } transition-colors`}
          >
            {s.label}
          </a>
        ))}
      </div>

      {circulars.length === 0 ? (
        <p className="text-sm text-ink/60">No circulars under {section.label} yet.</p>
      ) : (
        <div className="space-y-8">
          {circulars.map((circular) => (
            <CircularCard key={circular.slug} circular={circular} />
          ))}
        </div>
      )}
    </div>
  );
}

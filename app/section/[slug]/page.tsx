import { notFound } from 'next/navigation';
import CircularGridCard from '@/components/CircularGridCard';
import { getCircularsBySection } from '@/lib/data';
import { SECTION_OPTIONS } from '@/lib/constants';
import { summaryPreviewText } from '@/lib/sanitize';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = SECTION_OPTIONS.find((s) => s.value === slug);
  return { title: section ? `${section.label} — Karamchari Samachar` : 'Karamchari Samachar' };
}

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
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8 pb-4 border-b border-rule">
        {section.label}
      </h1>

      {circulars.length === 0 ? (
        <p className="text-sm text-ink/60">No circulars under {section.label} yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {circulars.map((circular) => (
            <CircularGridCard
              key={circular.slug}
              circular={{ ...circular, summary: summaryPreviewText(circular.summary) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

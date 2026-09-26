import { notFound } from 'next/navigation';
import CircularsShowcase from '@/components/CircularsShowcase';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getCircularsBySection } from '@/lib/data';
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

  const [sectionCirculars, allCirculars] = await Promise.all([
    getCircularsBySection(slug),
    getAllCirculars(),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div>
        <CircularsShowcase
          circulars={sectionCirculars.map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }))}
          heading={section.label}
        />
      </div>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}

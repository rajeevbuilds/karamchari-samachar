import { notFound } from 'next/navigation';
import Link from 'next/link';
import CircularsShowcase from '@/components/CircularsShowcase';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getCircularsBySection } from '@/lib/data';
import { SECTION_OPTIONS } from '@/lib/constants';
import { summaryPreviewText } from '@/lib/sanitize';

// Interactive tools filed under a section, shown above that section's
// circular listing so visitors browsing e.g. /section/calculators find the
// actual tool, not just articles about it. Add future calculators
// (Gratuity, Commutation, ...) here as they ship.
const SECTION_TOOLS: Record<string, { href: string; label: string }[]> = {
  calculators: [{ href: '/calculators/pension-ops', label: 'OPS Pension Calculator' }],
};

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
  const tools = SECTION_TOOLS[slug] ?? [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div>
        {tools.length > 0 && (
          <div className="border border-rule p-5 mb-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">Available Calculators</h2>
            <ul className="flex flex-col gap-2">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="inline-block text-sm font-medium text-paper bg-ink px-3.5 py-2 hover:bg-maroon transition-colors"
                  >
                    {tool.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <CircularsShowcase
          circulars={sectionCirculars.map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }))}
          heading={section.label}
        />
      </div>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import CircularsShowcase from '@/components/CircularsShowcase';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getCircularsBySection } from '@/lib/data';
import { SECTION_OPTIONS } from '@/lib/constants';
import { SECTION_TOOLS } from '@/lib/calculators';
import { summaryPreviewText } from '@/lib/sanitize';

const SECTION_TOOLS_INTRO: Record<string, string> = {
  calculators:
    'Free calculators for central government employees — estimate your pension, gratuity, and other retirement benefits in seconds.',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = SECTION_OPTIONS.find((s) => s.value === slug);
  if (!section) return {};
  return {
    title: section.label,
    description: `Latest ${section.label} — circulars, orders, news and updates for central and state government employees and pensioners, with links to the original documents.`,
    alternates: { canonical: `/section/${slug}` },
  };
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
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: section.label, item: `${SITE_URL}/section/${slug}` },
          ],
        }}
      />
      <div>
        {tools.length > 0 && (
          <div className="border border-rule p-5 mb-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-2">Available Calculators</h2>
            {SECTION_TOOLS_INTRO[slug] && (
              <p className="text-sm text-ink/70 mb-4 max-w-prose">{SECTION_TOOLS_INTRO[slug]}</p>
            )}
            <ul className="flex flex-col gap-4">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <p className="text-sm text-ink/70 mb-2 max-w-prose">{tool.description}</p>
                  <Link
                    href={tool.href}
                    className="inline-block text-sm font-medium text-paper bg-ink px-3.5 py-2 hover:bg-maroon transition-colors"
                  >
                    {tool.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <CircularsShowcase
          circulars={sectionCirculars.map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }))}
          heading={section.label}
          headingAs="h1"
        />
      </div>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}

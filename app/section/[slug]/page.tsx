import { notFound } from 'next/navigation';
import CircularsShowcase from '@/components/CircularsShowcase';
import CalculatorCards from '@/components/CalculatorCards';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getCircularsBySection } from '@/lib/data';
import { SECTION_OPTIONS } from '@/lib/constants';
import { SECTION_TOOLS } from '@/lib/calculators';
import { summaryPreviewText } from '@/lib/sanitize';

const SECTION_TOOLS_INTRO: Record<string, string> = {
  calculators:
    'Free Tools for Central Government Employees and Railway Employees: Estimate Your Pension, Gratuity and Pay in Seconds',
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
          <div className="mb-10 pt-8">
            <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{section.label}</h1>
            {SECTION_TOOLS_INTRO[slug] && (
              <p className="text-base font-medium text-ink/80 mb-6 max-w-prose leading-relaxed">{SECTION_TOOLS_INTRO[slug]}</p>
            )}
            <CalculatorCards tools={tools} />
          </div>
        )}
        {/* On a page with tools the tools lead; articles appear below only if there are any. */}
        {(tools.length === 0 || sectionCirculars.length > 0) && (
          <CircularsShowcase
            circulars={sectionCirculars.map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }))}
            heading={tools.length > 0 ? `${section.label} — related articles` : section.label}
            headingAs={tools.length > 0 ? 'h2' : 'h1'}
          />
        )}
      </div>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}

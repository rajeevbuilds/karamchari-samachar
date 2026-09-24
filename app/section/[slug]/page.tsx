import { notFound } from 'next/navigation';
import CategoryPage from '@/components/category/CategoryPage';
import { getCircularsBySection } from '@/lib/data';
import { SECTION_OPTIONS } from '@/lib/constants';

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

  return <CategoryPage title={section.label} circulars={circulars} />;
}

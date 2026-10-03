import HomeGrid from '@/components/HomeGrid';
import { getAllCirculars } from '@/lib/data';
import { summaryPreviewText } from '@/lib/sanitize';
import { SITE_TITLE } from '@/lib/site';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so newly published content would never appear.
export const dynamic = 'force-dynamic';

export const metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const circulars = await getAllCirculars();

  return (
    <>
      {/* The page's one h1 — kept for search engines and screen readers. */}
      <h1 className="sr-only">{SITE_TITLE}</h1>
      <HomeGrid circulars={circulars.map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }))} />
    </>
  );
}

import HomeGrid from '@/components/HomeGrid';
import { getAllCirculars } from '@/lib/data';
import { summaryPreviewText } from '@/lib/sanitize';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so newly published content would never appear.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const circulars = await getAllCirculars();

  return (
    <HomeGrid circulars={circulars.map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }))} />
  );
}

import CircularGridCard from '@/components/CircularGridCard';
import { getAllCirculars } from '@/lib/data';
import { summaryPreviewText } from '@/lib/sanitize';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so newly published content would never appear.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Circulars — Karamchari Samachar',
};

export default async function CircularsPage() {
  const circulars = await getAllCirculars();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-1">All Circulars</h1>
      <p className="text-sm text-ink/60 mb-8">
        {circulars.length} notifications, ordered by issue date
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {circulars.map((circular) => (
          <CircularGridCard
            key={circular.slug}
            circular={{ ...circular, summary: summaryPreviewText(circular.summary) }}
          />
        ))}
      </div>
    </div>
  );
}

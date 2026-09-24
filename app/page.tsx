import HomeGrid from '@/components/HomeGrid';
import { getAllCirculars, getLatestDa, getDaHistory } from '@/lib/data';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so newly published content would never appear.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [circulars, latestDa, daHistory] = await Promise.all([
    getAllCirculars(),
    getLatestDa(),
    getDaHistory(),
  ]);
  const previousDa = daHistory[1] ?? { percentage: latestDa.percentage };

  return (
    <HomeGrid
      circulars={circulars}
      daPercentage={latestDa.percentage}
      previousDaPercentage={previousDa.percentage}
      daEffectiveFrom={latestDa.effectiveFrom}
    />
  );
}

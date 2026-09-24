import HomeGrid from '@/components/HomeGrid';
import { getAllCirculars, getLatestDa, getDaHistory } from '@/lib/data';

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

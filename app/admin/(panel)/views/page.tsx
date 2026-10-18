import { requireAdmin } from '@/lib/auth';
import { getRecentCirculars, getTopViewedCirculars, getTotalSiteViews } from '@/lib/data';
import ViewsOverview from '@/components/admin/ViewsOverview';

export const metadata = {
  title: 'Post Views — Admin',
};

export default async function AdminViewsPage() {
  await requireAdmin();
  const [totalSiteViews, topViewed, recent] = await Promise.all([
    getTotalSiteViews(),
    getTopViewedCirculars(10),
    getRecentCirculars(3),
  ]);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">Post Views</h1>
      <ViewsOverview totalSiteViews={totalSiteViews} topViewed={topViewed} recent={recent} />
    </>
  );
}

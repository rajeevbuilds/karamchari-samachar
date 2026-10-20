import { requireAdmin } from '@/lib/auth';
import { getRecentCirculars, getTopViewedCirculars, getTotalSiteViews, todayIst } from '@/lib/data';
import ViewsOverview from '@/components/admin/ViewsOverview';
import ViewsByDate from '@/components/admin/ViewsByDate';

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
      <ViewsByDate today={todayIst()} />
    </>
  );
}

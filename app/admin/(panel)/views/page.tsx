import { requireAdmin } from '@/lib/auth';
import { getPageViews, getRecentCirculars, getTopViewedCirculars, getTotalSiteViews, todayIst } from '@/lib/data';
import PageViewsTable from '@/components/admin/PageViewsTable';
import ViewsOverview from '@/components/admin/ViewsOverview';
import ViewsByDate from '@/components/admin/ViewsByDate';

export const metadata = {
  title: 'Post Views — Admin',
};

export default async function AdminViewsPage() {
  await requireAdmin();
  const [totalSiteViews, topViewed, recent, pageViews] = await Promise.all([
    getTotalSiteViews(),
    getTopViewedCirculars(10),
    getRecentCirculars(3),
    getPageViews(),
  ]);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">Post Views</h1>
      <ViewsOverview totalSiteViews={totalSiteViews} topViewed={topViewed} recent={recent} />
      <PageViewsTable rows={pageViews} />
      <ViewsByDate today={todayIst()} />
    </>
  );
}

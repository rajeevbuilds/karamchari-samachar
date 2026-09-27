import { requireAdmin } from '@/lib/auth';
import { getAllCircularsAdmin, getTopViewedCirculars, getTotalSiteViews } from '@/lib/data';
import PostsManager from '@/components/admin/PostsManager';
import ViewsOverview from '@/components/admin/ViewsOverview';

export const metadata = {
  title: 'Posts — Admin',
};

export default async function AdminPostsPage() {
  await requireAdmin();
  const [circulars, totalSiteViews, topViewed] = await Promise.all([
    getAllCircularsAdmin(),
    getTotalSiteViews(),
    getTopViewedCirculars(10),
  ]);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">Posts</h1>
      <ViewsOverview totalSiteViews={totalSiteViews} topViewed={topViewed} />
      <PostsManager initialCirculars={circulars} />
    </>
  );
}

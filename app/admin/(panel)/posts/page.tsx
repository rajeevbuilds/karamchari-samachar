import { requireAdmin } from '@/lib/auth';
import { getAllCircularsAdmin } from '@/lib/data';
import PostsList from '@/components/admin/PostsList';

export const metadata = {
  title: 'All Posts — Admin',
};

export default async function AdminPostsPage() {
  await requireAdmin();
  const circulars = await getAllCircularsAdmin();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">All Posts</h1>
      <PostsList initialCirculars={circulars} />
    </>
  );
}

import { requireAdmin } from '@/lib/auth';
import { getAllCircularsAdmin } from '@/lib/data';
import PostsManager from '@/components/admin/PostsManager';

export const metadata = {
  title: 'Posts — Admin',
};

export default async function AdminPostsPage() {
  await requireAdmin();
  const circulars = await getAllCircularsAdmin();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">Posts</h1>
      <PostsManager initialCirculars={circulars} />
    </>
  );
}

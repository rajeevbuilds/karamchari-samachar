import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getAllCircularsAdmin } from '@/lib/data';
import PostForm from '@/components/admin/PostForm';

export const metadata = {
  title: 'Add New Post — Admin',
};

// "Add New Post", and also the edit screen when opened as /admin/new?edit=<id>
// (the Edit links in All Posts and on a circular's public page).
export default async function AdminNewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;

  let circular;
  if (edit) {
    const circulars = await getAllCircularsAdmin();
    circular = circulars.find((c) => c.id === Number(edit));
    if (!circular) notFound();
  }

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">
        {circular ? 'Edit Post' : 'Add New Post'}
      </h1>
      {/* key remounts the form if the ?edit id changes on the same page */}
      <PostForm key={circular?.id ?? 'new'} initialCircular={circular} />
    </>
  );
}

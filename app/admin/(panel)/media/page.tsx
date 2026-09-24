import { requireAdmin } from '@/lib/auth';
import MediaLibrary from '@/components/admin/MediaLibrary';

export const metadata = {
  title: 'Media — Admin',
};

export default async function AdminMediaPage() {
  await requireAdmin();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">Media</h1>
      <p className="text-sm text-ink/60 mb-8">
        Upload images for circulars, or find one in AIRF&rsquo;s media library. Click an image to copy its
        URL; in the post form, use <strong>Choose image</strong> to pick one directly.
      </p>
      <MediaLibrary />
    </>
  );
}

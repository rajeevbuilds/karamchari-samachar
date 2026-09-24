import { requireAdmin } from '@/lib/auth';
import AirfImport from '@/components/admin/AirfImport';

export const metadata = {
  title: 'Import from AIRF — Admin',
};

export default async function AdminImportPage() {
  await requireAdmin();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">Import from AIRF</h1>
      <p className="text-sm text-ink/60 mb-8">
        Pick a category from airfindia.org, select posts, and import them as <strong>draft</strong>{' '}
        circulars. Drafts stay hidden from the public site until you edit one in Posts, fill in its
        department, category, section and states, and save it as Published.
      </p>
      <AirfImport />
    </>
  );
}

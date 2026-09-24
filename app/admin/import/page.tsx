import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import AirfImport from '@/components/admin/AirfImport';

export const metadata = {
  title: 'Import from AIRF — Admin',
};

export default async function AdminImportPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <h1 className="font-serif text-3xl font-semibold text-ink">Import from AIRF</h1>
        <Link href="/admin" className="text-sm text-maroon hover:underline">
          ← Back to dashboard
        </Link>
      </div>
      <p className="text-sm text-ink/60 mb-8">
        Pick a category from airfindia.org, select posts, and import them as <strong>draft</strong>{' '}
        circulars. Drafts stay hidden from the public site until you edit one, fill in its
        department, category, section and states, and save it as Published.
      </p>
      <AirfImport />
    </div>
  );
}

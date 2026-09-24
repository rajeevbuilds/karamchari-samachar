import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllCircularsAdmin, getAllDaHistoryAdmin } from '@/lib/data';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { logoutAction } from './actions';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const [circulars, daHistory] = await Promise.all([
    getAllCircularsAdmin(),
    getAllDaHistoryAdmin(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-serif text-3xl font-semibold text-ink">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/import"
            className="text-sm font-medium text-paper bg-ink hover:bg-maroon px-3 py-1.5 transition-colors"
          >
            Import from AIRF
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-ink/70 hover:text-maroon border border-rule px-3 py-1.5 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
      <AdminDashboard initialCirculars={circulars} initialDaHistory={daHistory} />
    </div>
  );
}

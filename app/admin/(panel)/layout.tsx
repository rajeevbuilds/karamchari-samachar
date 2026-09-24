import { requireAdmin } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { logoutAction } from '../actions';

// Shared shell for every signed-in admin page: sidebar + content.
// /admin/login sits outside this route group, so it gets no sidebar.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-6 md:gap-10 items-start">
      <aside className="md:sticky md:top-6 border-b md:border-b-0 md:border-r border-rule pb-3 md:pb-0 md:pr-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink/50 px-3 mb-2">Admin</p>
        <AdminSidebar />
        <form action={logoutAction} className="px-3 mt-4 hidden md:block">
          <button type="submit" className="text-sm text-ink/60 hover:text-maroon">
            Log out
          </button>
        </form>
      </aside>
      <div className="min-w-0">
        {children}
        <form action={logoutAction} className="mt-10 md:hidden">
          <button type="submit" className="text-sm text-ink/60 hover:text-maroon">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

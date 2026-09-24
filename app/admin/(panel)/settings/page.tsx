import { requireAdmin } from '@/lib/auth';
import { getAllDaHistoryAdmin } from '@/lib/data';
import DaManager from '@/components/admin/DaManager';

export const metadata = {
  title: 'Settings — Admin',
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const daHistory = await getAllDaHistoryAdmin();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">Settings</h1>
      <DaManager initialDaHistory={daHistory} />
    </>
  );
}

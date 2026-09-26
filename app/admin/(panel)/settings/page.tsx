import { requireAdmin } from '@/lib/auth';
import { getAllDaHistoryAdmin, getAllSettings } from '@/lib/data';
import DaManager from '@/components/admin/DaManager';
import AdSettings from '@/components/admin/AdSettings';

export const metadata = {
  title: 'Settings — Admin',
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const daHistory = await getAllDaHistoryAdmin();
  const settings = await getAllSettings();

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">Settings</h1>
      <DaManager initialDaHistory={daHistory} />
      <div className="mt-10 pt-10 border-t border-rule">
        <AdSettings initialSettings={settings} />
      </div>
    </>
  );
}

import { requireAdmin } from '@/lib/auth';
import { getAllCircularsAdmin, getAllDaHistoryAdmin, getAllSettings } from '@/lib/data';
import DaManager from '@/components/admin/DaManager';
import AdSettings from '@/components/admin/AdSettings';
import PensionSettings from '@/components/admin/PensionSettings';
import ContactSettings from '@/components/admin/ContactSettings';
import Cpc8Settings from '@/components/admin/Cpc8Settings';

export const metadata = {
  title: 'Settings — Admin',
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const daHistory = await getAllDaHistoryAdmin();
  const settings = await getAllSettings();
  const pinnedId = Number(settings.cpc8_pinned_id) || null;
  const pinnedTitle = pinnedId ? ((await getAllCircularsAdmin()).find((c) => c.id === pinnedId)?.title ?? null) : null;

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-8">Settings</h1>
      <DaManager initialDaHistory={daHistory} />
      <div className="mt-10 pt-10 border-t border-rule">
        <Cpc8Settings initialSettings={settings} pinnedTitle={pinnedTitle} />
      </div>
      <div className="mt-10 pt-10 border-t border-rule">
        <AdSettings initialSettings={settings} />
      </div>
      <div className="mt-10 pt-10 border-t border-rule">
        <PensionSettings initialSettings={settings} />
      </div>
      <div className="mt-10 pt-10 border-t border-rule">
        <ContactSettings initialSettings={settings} />
      </div>
    </>
  );
}

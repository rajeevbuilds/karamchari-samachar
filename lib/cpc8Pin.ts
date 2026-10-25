import { getAllSettings, setSetting } from './data';

// Pins (or unpins) a post at the top of the 8th Pay Commission page. Only one post
// is pinned at a time, so pinning a new one replaces the old one. `pin` is null
// when the form did not say anything, in which case nothing changes. Only a
// published post in the 8th Pay Commission section can be pinned.
export async function applyCpc8Pin(
  id: number,
  pin: boolean | null,
  input: { status: string; sections: string[] }
): Promise<void> {
  if (pin === null) return;
  try {
    const settings = await getAllSettings();
    const current = Number(settings.cpc8_pinned_id) || null;
    const eligible = input.status === 'published' && input.sections.includes('pay-commission');
    if (pin && eligible) {
      if (current !== id) await setSetting('cpc8_pinned_id', String(id));
    } else if (current === id) {
      await setSetting('cpc8_pinned_id', '');
    }
  } catch (err) {
    console.error('applyCpc8Pin failed', err);
  }
}

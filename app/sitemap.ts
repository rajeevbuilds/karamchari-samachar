import type { MetadataRoute } from 'next';
import { getAllCirculars } from '@/lib/data';
import { SECTION_OPTIONS, STATE_OPTIONS } from '@/lib/constants';
import { SECTION_TOOLS } from '@/lib/calculators';
import { INFO_LINKS, SITE_URL } from '@/lib/site';

// Built from the database on every request, so a newly published post is in
// the sitemap straight away (no rebuild needed).
export const dynamic = 'force-dynamic';

// Posts store IST wall-clock time ("2026-09-28 14:30:00") or just a date, so
// pin the offset explicitly instead of trusting the server's own timezone.
function toDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const withTime = iso.length > 10 ? iso.replace(' ', 'T') : `${iso}T00:00:00`;
  const d = new Date(`${withTime}+05:30`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const circulars = await getAllCirculars();
  const latest = toDate(circulars[0]?.postedAt ?? circulars[0]?.issueDate);

  const entry = (
    path: string,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number,
    lastModified?: Date
  ): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${path}`, changeFrequency, priority, lastModified });

  const toolPaths = Object.values(SECTION_TOOLS).flat().map((t) => t.href);

  return [
    entry('/', 'hourly', 1, latest),
    entry('/circulars', 'daily', 0.8, latest),
    entry('/da-cpc-tracker', 'daily', 0.8, latest),
    ...SECTION_OPTIONS.map((s) => entry(`/section/${s.value}`, 'daily', 0.8, latest)),
    ...toolPaths.map((p) => entry(p, 'monthly', 0.7)),
    ...STATE_OPTIONS.map((s) => entry(`/states/${s}`, 'daily', 0.5, latest)),
    ...INFO_LINKS.map((l) => entry(l.href, 'yearly', 0.3)),
    ...circulars.map((c) => entry(`/circulars/${c.slug}`, 'weekly', 0.7, toDate(c.postedAt ?? c.issueDate))),
  ];
}

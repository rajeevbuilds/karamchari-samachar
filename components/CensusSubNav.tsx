import Link from 'next/link';

const TABS = [
  { href: '/census-2027', label: 'मुख्य पेज' },
  { href: '/census-2027/checklist', label: 'Checklist' },
  { href: '/census-2027/app-guide', label: 'App Guide' },
  { href: '/census-2027/faq', label: 'FAQ' },
] as const;

export default function CensusSubNav({ active }: { active: (typeof TABS)[number]['href'] }) {
  return (
    <nav aria-label="Census 2027 pages" className="flex flex-wrap gap-2 mb-6 print:hidden">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={
            active === t.href
              ? 'px-3 py-1.5 rounded-full text-sm font-semibold bg-maroon text-white'
              : 'px-3 py-1.5 rounded-full text-sm font-semibold text-maroon border border-rule hover:border-maroon'
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

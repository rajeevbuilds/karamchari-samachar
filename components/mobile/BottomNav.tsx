'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive } from '../MainNav';

const BOTTOM_NAV = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <path d="M3 10L11 3L19 10M5 8.5V18H9V13H13V18H17V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    href: '/section/dopt',
    label: 'DOPT',
    icon: (
      <path
        d="M6 2.5H13L16.5 6V19.5H6V2.5Z M13 2.5V6H16.5 M8.5 11H14 M8.5 14.5H14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: '/da-cpc-tracker',
    label: '8th CPC',
    icon: (
      <path
        d="M11 2.5V4.5 M11 17.5V19.5 M5.5 6.5C5.5 5 7 4 9 4H12.5C14 4 15.5 5 15.5 6.5C15.5 8.5 13.5 9 11 9.5C8.5 10 6.5 10.5 6.5 12.5C6.5 14 8 15 9.5 15H13C15 15 16.5 14 16.5 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    href: '/section/calculators',
    label: 'Calculators',
    icon: (
      <path
        d="M5 2.5H17V19.5H5V2.5Z M7.5 5.5H14.5 M7.5 9H9.5 M12.5 9H14.5 M7.5 12H9.5 M12.5 12H14.5 M7.5 15H9.5 M12.5 15H14.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-rule bg-paper"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {BOTTOM_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold ${
              active ? 'text-maroon' : 'text-ink/70'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              {item.icon}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

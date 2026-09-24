'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/import', label: 'Import' },
  { href: '/admin/settings', label: 'Settings' },
];

// Vertical on desktop, a horizontal strip on small screens.
export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex md:flex-col gap-1 overflow-x-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block whitespace-nowrap px-3 py-2 text-sm border-l-2 transition-colors ${
                  active
                    ? 'border-maroon bg-maroon/5 text-maroon font-medium'
                    : 'border-transparent text-ink/70 hover:text-maroon hover:bg-rule/30'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

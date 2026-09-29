'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PRIMARY_NAV = [
  { href: '/', label: 'Home' },
  { href: '/section/railway-board', label: 'Railway Board Circular' },
  { href: '/section/dopt', label: 'DOPT Circular' },
  { href: '/section/fin-min', label: 'Fin Min Circular' },
  { href: '/section/defence', label: 'Defence' },
  { href: '/da-cpc-tracker', label: '8th Pay Commission' },
  { href: '/section/news-paper-reports', label: 'News Paper Reports' },
  { href: '/section/calculators', label: 'Calculators' },
];

// Less-trafficked sections and tools, tucked under "More" so the primary
// bar doesn't get cluttered.
export const MORE_NAV = [
  { href: '/section/nps', label: 'NPS' },
  { href: '/section/cghs', label: 'CGHS' },
  { href: '/section/ups', label: 'UPS' },
  { href: '/section/analysis', label: 'Analysis' },
  { href: '/section/pay-commission', label: 'Pay Commission Circulars' },
  { href: '/calculators/pension-ops', label: 'Pension Calculator' },
  { href: '/states/punjab', label: 'By State' },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

// Shared text treatment: bold always, underline on hover, underline stays
// on the active page (on top of the maroon active tint).
function linkClassName(active: boolean): string {
  return `font-bold hover:underline transition-colors ${
    active ? 'text-maroon underline' : 'text-ink/80 hover:text-maroon'
  }`;
}

export default function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const moreActive = MORE_NAV.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Close the dropdown on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="border-t border-rule">
      <div className="mx-auto max-w-[1200px] px-4 flex items-center gap-x-6">
        {/* Only the primary items scroll horizontally on narrow screens.
            "More" and its dropdown live outside this container: setting
            overflow-x on an element implicitly makes overflow-y "auto" too
            (per the CSS spec), which was clipping the dropdown panel down
            to nothing since it used to be a descendant of this same
            scrolling list. */}
        <ul className="flex flex-nowrap items-center gap-x-6 gap-y-1 text-sm py-2.5 overflow-x-auto min-w-0">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} className={linkClassName(isActive(pathname, item.href))}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div ref={containerRef} className="relative shrink-0 py-2.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="true"
            className={`flex items-center gap-1 text-sm ${linkClassName(moreActive)}`}
          >
            More
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && (
            <ul className="absolute right-0 top-full mt-1 min-w-[220px] border border-rule bg-paper shadow-md py-1 z-20">
              {MORE_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 text-sm whitespace-nowrap ${linkClassName(isActive(pathname, item.href))}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

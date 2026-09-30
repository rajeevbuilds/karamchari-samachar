'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SWIPE_TRANSITION_MS } from './mobile/swipeConstants';

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
  { href: '/calculators/gratuity', label: 'Gratuity Calculator' },
  { href: '/calculators/nps', label: 'NPS & UPS Calculator' },
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

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Animates scrollLeft over `duration` ms instead of jumping instantly, so it
// reads as one motion alongside the page-content slide (SwipeTransition).
function animateScrollTo(el: HTMLElement, target: number, duration: number) {
  const start = el.scrollLeft;
  const change = target - start;
  if (Math.abs(change) < 1) return () => {};

  let raf = 0;
  let startTime: number | null = null;

  function step(timestamp: number) {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(1, elapsed / duration);
    el.scrollLeft = start + change * easeOutCubic(progress);
    if (progress < 1) {
      raf = requestAnimationFrame(step);
    }
  }

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export default function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  // Whenever the active top-nav item changes - via a swipe or a normal tap -
  // smoothly scroll the strip so that item is centered (or as close to
  // centered as the scrollable range allows). Timed to roughly match the
  // page-content slide in SwipeTransition, so both read as one motion.
  useEffect(() => {
    if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) return;
    const ul = listRef.current;
    if (!ul) return;

    const activeIndex = PRIMARY_NAV.findIndex((item) => isActive(pathname, item.href));
    if (activeIndex === -1) return;
    const activeLi = ul.children[activeIndex] as HTMLElement | undefined;
    if (!activeLi) return;

    const target = activeLi.offsetLeft + activeLi.offsetWidth / 2 - ul.clientWidth / 2;
    const maxScroll = ul.scrollWidth - ul.clientWidth;
    const clamped = Math.max(0, Math.min(target, maxScroll));

    const cancel = animateScrollTo(ul, clamped, SWIPE_TRANSITION_MS);
    return cancel;
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
        <ul
          ref={listRef}
          className="flex flex-nowrap items-center gap-x-6 gap-y-1 text-sm py-2.5 overflow-x-auto min-w-0 touch-pan-x"
        >
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

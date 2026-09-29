'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PRIMARY_NAV } from '../MainNav';

// Category pages eligible for swipe navigation, in top-nav order. Home is
// excluded - swiping only moves between the category pages themselves.
const CATEGORY_PAGES = PRIMARY_NAV.filter((item) => item.href !== '/').map((item) => item.href);

const SWIPE_THRESHOLD = 60;
const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

export default function SwipeNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) return;

    const currentIndex = CATEGORY_PAGES.indexOf(pathname);
    if (currentIndex === -1) return;

    let startX = 0;
    let startY = 0;
    let ignore = false;

    function onTouchStart(e: TouchEvent) {
      const target = e.target as HTMLElement;
      // Skip touches starting on the top nav (its own horizontal scroll) or
      // any horizontally-scrollable content (e.g. rich-text tables).
      ignore = !!target.closest('nav, .rich-text');
      if (ignore) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      if (ignore) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      if (dx < 0 && currentIndex < CATEGORY_PAGES.length - 1) {
        router.push(CATEGORY_PAGES[currentIndex + 1]);
      } else if (dx > 0 && currentIndex > 0) {
        router.push(CATEGORY_PAGES[currentIndex - 1]);
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [pathname, router]);

  return null;
}

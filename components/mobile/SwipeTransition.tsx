'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PRIMARY_NAV } from '../MainNav';
import { useSwipeSlideStyle, useSwipeSlideControls, SWIPE_TRANSITION_MS } from './SwipeSlideContext';

// Category pages eligible for swipe navigation, in top-nav order. Home is
// excluded - swiping only moves between the category pages themselves.
const CATEGORY_PAGES = PRIMARY_NAV.filter((item) => item.href !== '/').map((item) => item.href);

const SWIPE_THRESHOLD = 60;
const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

// Wraps the page content in <main>. Listeners are attached to this element
// only - the top nav strip lives outside it (in the header), so its own
// overflow-x-auto scroll is never in the gesture's path and never has to be
// special-cased. On a valid horizontal swipe on a category page, the shared
// slide position (see SwipeSlideContext) is driven so <main> and the nav
// strip move together, then the next/previous page slides in from that side.
export default function SwipeTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement>(null);
  const navigatingRef = useRef(false);
  const pendingEnterFromRef = useRef<number | null>(null);
  const style = useSwipeSlideStyle();
  const { beginExit, applyEnterStart, applyEnterAnimate, settle } = useSwipeSlideControls();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) return;

    const currentIndex = CATEGORY_PAGES.indexOf(pathname);
    if (currentIndex === -1) return;

    let startX = 0;
    let startY = 0;
    let ignore = false;

    function onTouchStart(e: TouchEvent) {
      const target = e.target as HTMLElement;
      // Skip touches starting on horizontally-scrollable content within the
      // page itself (e.g. rich-text tables).
      ignore = !!target.closest('.rich-text');
      if (ignore) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      if (ignore || navigatingRef.current) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      let nextHref: string | null = null;
      if (dx < 0 && currentIndex < CATEGORY_PAGES.length - 1) {
        nextHref = CATEGORY_PAGES[currentIndex + 1];
      } else if (dx > 0 && currentIndex > 0) {
        nextHref = CATEGORY_PAGES[currentIndex - 1];
      }
      if (!nextHref) return;

      navigatingRef.current = true;
      const exitTo = dx < 0 ? -100 : 100;
      pendingEnterFromRef.current = dx < 0 ? 100 : -100;
      beginExit(exitTo);

      window.setTimeout(() => {
        router.push(nextHref as string);
      }, SWIPE_TRANSITION_MS);
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [pathname, router, beginExit]);

  // Runs whenever the route actually changes. If that change was triggered
  // by our own swipe, animate the new content (and nav strip, via the shared
  // context) in from the matching side; otherwise stay settled at rest.
  useEffect(() => {
    const enterFrom = pendingEnterFromRef.current;
    if (enterFrom === null) {
      settle();
      return;
    }
    pendingEnterFromRef.current = null;
    applyEnterStart(enterFrom);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        applyEnterAnimate();
        navigatingRef.current = false;
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <main ref={containerRef} style={style}>
      {children}
    </main>
  );
}

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const SWIPE_TRANSITION_MS = 220;

type SlideStyle = { transform: string; transition: string } | undefined;

interface SwipeSlideContextValue {
  style: SlideStyle;
  beginExit: (exitTo: number) => void;
  applyEnterStart: (enterFrom: number) => void;
  applyEnterAnimate: () => void;
  settle: () => void;
}

const SwipeSlideContext = createContext<SwipeSlideContextValue | null>(null);

// Shared slide position for the nav strip and the main content, so a swipe
// between category pages moves both as one unit (like a tab-bar carousel)
// instead of animating <main> alone while the nav strip stays put.
export function SwipeSlideProvider({ children }: { children: React.ReactNode }) {
  const [translate, setTranslate] = useState(0);
  const [transitionOn, setTransitionOn] = useState(false);

  const beginExit = useCallback((exitTo: number) => {
    setTransitionOn(true);
    setTranslate(exitTo);
  }, []);

  const applyEnterStart = useCallback((enterFrom: number) => {
    setTransitionOn(false);
    setTranslate(enterFrom);
  }, []);

  const applyEnterAnimate = useCallback(() => {
    setTransitionOn(true);
    setTranslate(0);
  }, []);

  const settle = useCallback(() => {
    setTransitionOn(false);
    setTranslate(0);
  }, []);

  const style: SlideStyle =
    translate === 0
      ? undefined
      : {
          transform: `translateX(${translate}%)`,
          transition: transitionOn ? `transform ${SWIPE_TRANSITION_MS}ms ease` : 'none',
        };

  const value = useMemo(
    () => ({ style, beginExit, applyEnterStart, applyEnterAnimate, settle }),
    [style, beginExit, applyEnterStart, applyEnterAnimate, settle]
  );

  return <SwipeSlideContext.Provider value={value}>{children}</SwipeSlideContext.Provider>;
}

export function useSwipeSlideStyle(): SlideStyle {
  return useContext(SwipeSlideContext)?.style;
}

export function useSwipeSlideControls() {
  const ctx = useContext(SwipeSlideContext);
  if (!ctx) throw new Error('useSwipeSlideControls must be used within SwipeSlideProvider');
  return ctx;
}

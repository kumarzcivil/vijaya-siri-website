import { useState, useEffect, useCallback, useRef } from 'react';

interface UseHeroSliderOptions {
  totalSlides: number;
  autoplayInterval?: number;
}

export function useHeroSlider({ totalSlides, autoplayInterval = 6000 }: UseHeroSliderOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (totalSlides <= 0) return;
      setActiveIndex(((index % totalSlides) + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  const next = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const prev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (totalSlides <= 1 || isPaused || prefersReducedMotion.current) return;

    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, autoplayInterval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, totalSlides, isPaused, autoplayInterval]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
      } else if (!isPaused && totalSlides > 1 && !prefersReducedMotion.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % totalSlides);
        }, autoplayInterval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPaused, totalSlides, autoplayInterval]);

  return { activeIndex, goTo, next, prev, pause, resume, prefersReducedMotion: prefersReducedMotion.current };
}

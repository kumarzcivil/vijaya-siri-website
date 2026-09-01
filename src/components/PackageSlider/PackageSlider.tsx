import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import './PackageSlider.css';

interface PackageSliderProps {
  children: ReactNode[];
}

export default function PackageSlider({ children }: PackageSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track active index via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !isMobile) return;

    const cards = container.querySelectorAll<HTMLElement>('.package-slider-card');
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Array.from(cards).indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [isMobile, children.length]);

  const scrollTo = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement | undefined;
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => {
      const next = Math.max(0, prev - 1);
      scrollTo(next);
      return next;
    });
  }, [scrollTo]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => {
      const next = Math.min(children.length - 1, prev + 1);
      scrollTo(next);
      return next;
    });
  }, [scrollTo, children.length]);

  return (
    <div className="package-slider">
      <div
        ref={scrollRef}
        className="package-slider-track"
        role="region"
        aria-label="Package cards"
      >
        {children.map((child, i) => (
          <div key={i} className="package-slider-card">
            {child}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="package-slider-controls">
        <button
          type="button"
          className="package-slider-arrow"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="Previous package"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="package-slider-dots">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`package-slider-dot ${i === activeIndex ? 'package-slider-dot--active' : ''}`}
              onClick={() => {
                setActiveIndex(i);
                scrollTo(i);
              }}
              aria-label={`Go to package ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className="package-slider-arrow"
          onClick={goNext}
          disabled={activeIndex === children.length - 1}
          aria-label="Next package"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

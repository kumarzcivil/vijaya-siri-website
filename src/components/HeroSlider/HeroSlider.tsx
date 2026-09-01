import { useMemo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeroSlider } from '../../hooks/useHeroSlider';
import { getActiveProFixHeroAds, isSeededHeroAd } from '../../data/hero-advertisements';
import './HeroSlider.css';

interface Advertisement {
  id: string;
  image: string;
  alt: string;
  destination: string;
}

const SWIPE_THRESHOLD_PX = 48;

function buildSlides(): Advertisement[] {
  return getActiveProFixHeroAds()
    .filter((ad) => !!ad.image)
    .map((ad) => ({
      id: ad.id,
      image: ad.image,
      alt: isSeededHeroAd(ad.id)
        ? (ad.description || ad.title)
        : (ad.title || 'Pro Fix advertisement'),
      destination: ad.ctaTarget || '',
    }));
}

export default function HeroSlider() {
  const navigate = useNavigate();

  const slides = useMemo<Advertisement[]>(buildSlides, []);

  const { activeIndex, goTo, next, prev, pause, resume } = useHeroSlider({
    totalSlides: slides.length,
    autoplayInterval: 5000,
  });

  const [brokenImageIds, setBrokenImageIds] = useState<ReadonlySet<string>>(new Set());

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const swipingRef = useRef(false);

  const handleSlideClick = useCallback(
    (slide: Advertisement) => {
      if (!slide.destination) return;
      if (slide.destination.startsWith('http')) {
        window.open(slide.destination, '_blank', 'noopener,noreferrer');
      } else {
        navigate(slide.destination);
      }
    },
    [navigate]
  );

  /* ---- Touch swipe ---- */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchDeltaX.current = 0;
      swipingRef.current = false;
      pause();
    },
    [pause]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD_PX) {
      swipingRef.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX && slides.length > 1) {
      if (delta < 0) {
        next();
      } else {
        prev();
      }
    }
    window.setTimeout(() => {
      swipingRef.current = false;
      resume();
    }, 50);
  }, [next, prev, resume, slides.length]);

  /* Suppress the click that follows a swipe gesture so a swipe
     never accidentally activates a poster destination. */
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (swipingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleImageError = useCallback((id: string) => {
    setBrokenImageIds((prev) => {
      if (prev.has(id)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(id);
      return nextSet;
    });
  }, []);

  if (slides.length === 0) return null;

  return (
    <div
      className="phs-slider"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClickCapture={handleClickCapture}
      aria-label="Pro Fix advertisements"
      role="region"
    >
      <div className="phs-track">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            className={`phs-slide ${i === activeIndex ? 'phs-slide--active' : ''}`}
            onClick={() => handleSlideClick(slide)}
            aria-hidden={i !== activeIndex}
            tabIndex={i === activeIndex ? 0 : -1}
            aria-label={`Advertisement ${i + 1} of ${slides.length}: ${slide.alt}`}
            style={slide.destination ? undefined : { cursor: 'default' }}
            type="button"
          >
            {brokenImageIds.has(slide.id) ? (
              <span className="phs-slide-fallback" role="img" aria-label={slide.alt} />
            ) : (
              <img
                src={slide.image}
                alt={slide.alt}
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={() => handleImageError(slide.id)}
              />
            )}
          </button>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="phs-pagination" role="tablist" aria-label="Advertisement navigation">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`phs-dot ${i === activeIndex ? 'phs-dot--active' : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to advertisement ${i + 1}: ${slide.alt}`}
            />
          ))}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button className="phs-arrow phs-arrow--prev" onClick={prev} aria-label="Previous advertisement" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="phs-arrow phs-arrow--next" onClick={next} aria-label="Next advertisement" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeroSlider } from '../../hooks/useHeroSlider';
import { fetchQuickFixBanners, type QuickFixBanner as ApiBanner } from '../../api/quickFix';
import './QuickFixBannerCarousel.css';

const SWIPE_THRESHOLD_PX = 48;

interface Banner {
  id: string;
  image: string;
  internalName: string;
  active: boolean;
  displayOrder: number;
  startDate: string;
  endDate: string;
  ctaLabel: string;
  destinationType: 'none' | 'service' | 'category' | 'external';
  destination: string;
}

interface QuickFixBannerCarouselProps {
  onCategorySelect: (categoryId: string) => void;
}

export default function QuickFixBannerCarousel({ onCategorySelect }: QuickFixBannerCarouselProps) {
  const navigate = useNavigate();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickFixBanners({ active: true })
      .then((data) => {
        const today = new Date().toISOString().slice(0, 10);
        const mapped = data
          .filter((b) => b.startDate <= today && b.endDate >= today)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((b) => ({
            id: b._id,
            image: b.image?.url ?? '',
            internalName: b.internalName,
            active: b.active,
            displayOrder: b.displayOrder,
            startDate: b.startDate,
            endDate: b.endDate,
            ctaLabel: b.ctaLabel,
            destinationType: b.destinationType,
            destination: b.destination,
          }));
        setBanners(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { activeIndex, goTo, next, prev, pause, resume } = useHeroSlider({
    totalSlides: banners.length,
    autoplayInterval: 5000,
  });

  const [brokenImageIds, setBrokenImageIds] = useState<ReadonlySet<string>>(new Set());

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const swipingRef = useRef(false);

  const isNavigable = useCallback(
    (banner: Banner) =>
      banner.destinationType !== 'none' && !!banner.destination,
    []
  );

  const handleBannerClick = useCallback(
    (banner: Banner) => {
      if (!isNavigable(banner)) return;
      switch (banner.destinationType) {
        case 'service':
          navigate(`/quick-fix/${banner.destination}`);
          break;
        case 'category':
          onCategorySelect(banner.destination);
          break;
        case 'external':
          window.open(banner.destination, '_blank', 'noopener,noreferrer');
          break;
        default:
          break;
      }
    },
    [isNavigable, navigate, onCategorySelect]
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
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX && banners.length > 1) {
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
  }, [next, prev, resume, banners.length]);

  /* Suppress the click that follows a swipe gesture so a swipe
     never accidentally activates a banner destination. */
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

  if (banners.length === 0) return null;

  return (
    <div
      className="qfb-carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClickCapture={handleClickCapture}
      aria-label="Quick Fix offers"
      role="region"
    >
      <div className="qfb-track">
        {banners.map((banner, i) => {
          const navigable = isNavigable(banner);
          return (
            <button
              key={banner.id}
              type="button"
              className={`qfb-slide ${i === activeIndex ? 'qfb-slide--active' : ''}`}
              onClick={() => handleBannerClick(banner)}
              aria-hidden={i !== activeIndex}
              tabIndex={i === activeIndex ? 0 : -1}
              aria-label={`Offer ${i + 1} of ${banners.length}: ${banner.internalName}${navigable ? '' : ' (display only)'}`}
              style={navigable ? undefined : { cursor: 'default' }}
            >
              {brokenImageIds.has(banner.id) ? (
                <span className="qfb-slide-fallback" role="img" aria-label={banner.internalName} />
              ) : (
                <img
                  src={banner.image}
                  alt={banner.internalName}
                  draggable={false}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  onError={() => handleImageError(banner.id)}
                />
              )}
              {navigable && banner.ctaLabel && (
                <span className="qfb-slide-cta">{banner.ctaLabel}</span>
              )}
            </button>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className="qfb-pagination" role="tablist" aria-label="Offer navigation">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              className={`qfb-dot ${i === activeIndex ? 'qfb-dot--active' : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to offer ${i + 1}: ${banner.internalName}`}
            />
          ))}
        </div>
      )}

      {banners.length > 1 && (
        <>
          <button className="qfb-arrow qfb-arrow--prev" onClick={prev} aria-label="Previous offer" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="qfb-arrow qfb-arrow--next" onClick={next} aria-label="Next offer" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

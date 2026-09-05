import { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from '../ProjectCard/ProjectCard';
import './FeaturedCarousel.css';

interface FeaturedProject {
  id: string;
  name: string;
  location: string;
  city: string;
  type: string;
  size: string;
  bedrooms: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  statusLabel: string;
  rating: number;
  imageUrl: string;
  features: string[];
  tags: string[];
  featured: boolean;
  displayOrder: number;
}

interface FeaturedCarouselProps {
  projects: FeaturedProject[];
}

export default function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const getCardWidth = useCallback(() => {
    if (!trackRef.current) return 300;
    const firstCard = trackRef.current.children[0] as HTMLElement;
    if (!firstCard) return 300;
    const style = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(style.gap) || 24;
    return firstCard.offsetWidth + gap;
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || projects.length <= 1) return;

    const track = trackRef.current;
    if (!track) return;

    const speed = 0.35;
    let lastTime = performance.now();

    const animate = (now: number) => {
      if (!pausedRef.current) {
        const delta = now - lastTime;
        const cardWidth = getCardWidth();
        const singleSetWidth = cardWidth * projects.length;

        posRef.current -= speed * (delta / 16.67);

        if (Math.abs(posRef.current) >= singleSetWidth) {
          posRef.current += singleSetWidth;
        }

        track.style.transform = `translateX(${posRef.current}px)`;
      }
      lastTime = now;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, projects.length, getCardWidth]);

  const handlePause = () => {
    pausedRef.current = true;
    forceUpdate((n) => n + 1);
  };

  const handleResume = () => {
    pausedRef.current = false;
    forceUpdate((n) => n + 1);
  };

  const handleTouchStart = () => {
    if (isMobile) return;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    pausedRef.current = true;
    forceUpdate((n) => n + 1);
  };

  const handleTouchEnd = () => {
    if (isMobile) return;
    touchTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      forceUpdate((n) => n + 1);
    }, 3000);
  };

  const displayProjects = isMobile || projects.length <= 1 ? projects : [...projects, ...projects, ...projects];

  return (
    <div
      className={`featured-carousel${isMobile ? ' featured-carousel--mobile' : ''}`}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Featured projects carousel"
      aria-roledescription="carousel"
    >
      <div className="featured-carousel-track" ref={trackRef}>
        {displayProjects.map((project, i) => (
          <div
            key={`${project.id}-${i}`}
            className="featured-carousel-item"
            role="group"
            aria-roledescription="slide"
            aria-label={`${(i % projects.length) + 1} of ${projects.length}: ${project.name}`}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}

import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveVisuals, heroConfig } from './heroConfig';
import './Hero.css';

const visuals = getActiveVisuals();
const IMAGE_COUNT = visuals.length;
const { displayDuration, transitionDuration } = heroConfig.rotation;

export default function Hero() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const prefersReduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (prefersReduced.current || IMAGE_COUNT <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => {
        let next = (i + 1) % IMAGE_COUNT;
        let attempts = 0;
        while (failedImages.has(visuals[next].id) && attempts < IMAGE_COUNT) {
          next = (next + 1) % IMAGE_COUNT;
          attempts++;
        }
        return next;
      });
    }, displayDuration);
    return () => clearInterval(id);
  }, [failedImages]);

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const scrollToQuote = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate('/quote');
    },
    [navigate]
  );

  const scrollToProjects = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('featured-projects');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const activeVisual = visuals[activeIndex] || visuals[0];

  return (
    <section className="hero">
      {/* Preload first image */}
      <link
        rel="preload"
        as="image"
        href={activeVisual.webp}
        type="image/webp"
      />

      <div className="hero-bg-pattern" aria-hidden="true" />
      <div className="hero-inner section-container">
        {/* ── LEFT: content ── */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted Residential Construction
          </div>
          <h1 className="hero-title">
            Your Dream Home.
            <br />
            <span className="hero-title-accent">Built with Trust.</span>
          </h1>
          <p className="hero-description">
            Quality construction, transparent pricing and on-time completion
            &mdash; from modern homes to luxury villas.
          </p>
          <div className="hero-actions">
            <a
              href="#quote-cta"
              className="hero-cta-primary"
              onClick={scrollToQuote}
            >
              Get Free Quote
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a
              href="#featured-projects"
              className="hero-cta-secondary"
              onClick={scrollToProjects}
            >
              Browse Projects
            </a>
          </div>
          <div className="hero-credibility">
            <div className="hero-credibility-item">
              <div className="hero-cred-check">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Certified &amp; Insured</span>
            </div>
            <div className="hero-credibility-item">
              <div className="hero-cred-check hero-cred-check--assurance">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <span>10-Year Assurance</span>
            </div>
            <div className="hero-credibility-item">
              <div className="hero-cred-check">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>On-Time Completion</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: visual panel ── */}
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-image-wrapper">
            <div className="hero-image-frame">
              {/* Architectural image layers */}
              {visuals.map((vis, i) => (
                <div
                  key={vis.id}
                  className={`hero-visual-layer ${
                    i === activeIndex ? 'hero-visual-layer--active' : ''
                  }`}
                  style={
                    {
                      '--layer-delay': `${transitionDuration}ms`,
                    } as React.CSSProperties
                  }
                >
                  <picture>
                    <source
                      srcSet={vis.webp}
                      type="image/webp"
                    />
                    <img
                      className="hero-arch-img"
                      src={vis.png}
                      alt=""
                      draggable={false}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      onError={() => handleImageError(vis.id)}
                    />
                  </picture>
                </div>
              ))}

              {/* Subtle grid texture */}
              <div className="hero-visual-grid" />

              {/* Floating proof card — LEFT */}
              <div className="hero-proof hero-proof--left">
                <div className="hero-proof-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="hero-proof-data">
                  <span className="hero-proof-number">500+</span>
                  <span className="hero-proof-text">Homes Built</span>
                </div>
              </div>

              {/* Floating proof card — RIGHT */}
              <div className="hero-proof hero-proof--right">
                <div className="hero-proof-icon hero-proof-icon--star">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="hero-proof-data">
                  <span className="hero-proof-number">4.8</span>
                  <span className="hero-proof-text">Customer Rating</span>
                </div>
              </div>

              {/* Process indicator */}
              <div className="hero-process">
                <div className="hero-process-step">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span>PLAN</span>
                </div>
                <span className="hero-process-line" />
                <div className="hero-process-step hero-process-step--active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="16" rx="2" />
                    <path d="M12 2v4" />
                    <path d="M6 2v4" />
                    <path d="M18 2v4" />
                  </svg>
                  <span>BUILD</span>
                </div>
                <span className="hero-process-line" />
                <div className="hero-process-step">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>DELIVER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

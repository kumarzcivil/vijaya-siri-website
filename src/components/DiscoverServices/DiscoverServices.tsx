import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveMarketingServices } from '../../data';
import type { Service } from '../../data';
import './DiscoverServices.css';

function formatServiceNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export default function DiscoverServices() {
  const navigate = useNavigate();
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const activeServices: Service[] = useMemo(() => getActiveMarketingServices(), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setRevealed(new Set(activeServices.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-service-index'));
          if (entry.isIntersecting) {
            setRevealed((prev) => {
              const next = new Set(prev);
              next.add(idx);
              return next;
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    rowRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeServices]);

  const handleServiceClick = (service: Service) => {
    if (service.path) {
      navigate(service.path);
    }
  };

  return (
    <div className="discover-services">
      <div className="discover-services-list">
        {activeServices.map((service, index) => (
          <button
            key={service.id}
            ref={(el) => { rowRefs.current[index] = el; }}
            data-service-index={index}
            className={`discover-service-row ${revealed.has(index) ? 'discover-service-row--revealed' : ''}`}
            onClick={() => handleServiceClick(service)}
            style={{ '--stagger-delay': `${index * 80}ms` } as React.CSSProperties}
          >
            <span className="discover-service-number">{formatServiceNumber(index)}</span>
            <div className="discover-service-content">
              <h3 className="discover-service-title">{service.title}</h3>
              <p className="discover-service-desc">{service.description}</p>
            </div>
            <span className="discover-service-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

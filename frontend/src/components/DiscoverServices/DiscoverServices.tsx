import { useEffect, useRef, useState } from 'react';
import { fetchMarketingServices, type MarketingService } from '../../api/marketing';
import './DiscoverServices.css';

function formatServiceNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export default function DiscoverServices() {
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [activeServices, setActiveServices] = useState<MarketingService[]>([]);

  useEffect(() => {
    fetchMarketingServices()
      .then((data) => setActiveServices(data.filter((s) => s.status === 'active').sort((a, b) => a.displayOrder - b.displayOrder)))
      .catch(() => {});
  }, []);

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

  return (
    <div className="discover-services">
      <div className="discover-services-list">
        {activeServices.map((service, index) => (
          <div
            key={service._id}
            ref={(el) => { rowRefs.current[index] = el; }}
            data-service-index={index}
            className={`discover-service-row ${revealed.has(index) ? 'discover-service-row--revealed' : ''}`}
            style={{ '--stagger-delay': `${index * 80}ms` } as React.CSSProperties}
          >
            <span className="discover-service-number">{formatServiceNumber(index)}</span>
            <div className="discover-service-content">
              <h3 className="discover-service-title">{service.title}</h3>
              <p className="discover-service-desc">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMarketingStats, type MarketingStat } from '../../api/marketing';
import Icon from '../Icon/Icon';
import './Statistics.css';

function parseStatValue(value: string): { numeric: number; suffix: string } {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return { numeric: 0, suffix: value };
  return { numeric: parseFloat(match[1]), suffix: match[2] };
}

interface AnimatedStatProps {
  value: string;
  label: string;
  icon: string;
  delay: number;
}

function AnimatedStat({ value, label, icon, delay }: AnimatedStatProps) {
  const [displayed, setDisplayed] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setDisplayed(value);
      return;
    }

    const { numeric, suffix } = parseStatValue(value);
    if (numeric === 0) {
      setDisplayed(value);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();
    const isDecimal = value.includes('.');
    const hasPlus = value.includes('+');

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;

      let formatted: string;
      if (isDecimal) {
        formatted = current.toFixed(1);
      } else {
        formatted = Math.round(current).toString();
      }
      if (hasPlus) formatted += '+';
      if (suffix && !hasPlus) formatted += suffix;

      setDisplayed(formatted);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayed(value);
      }
    };

    setTimeout(() => requestAnimationFrame(step), delay);
  }, [value, delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <div ref={ref} className="proof-stat">
      <div className="proof-stat-icon" aria-hidden="true">
        <Icon name={icon} size={18} />
      </div>
      <div className="proof-stat-content">
        <span className="proof-stat-value">{displayed}</span>
        <span className="proof-stat-label">{label}</span>
      </div>
    </div>
  );
}

export default function Statistics() {
  const [stats, setStats] = useState<MarketingStat[]>([]);

  useEffect(() => {
    fetchMarketingStats()
      .then((data) => setStats(data.filter((s) => s.status === 'active').sort((a, b) => a.displayOrder - b.displayOrder)))
      .catch(() => {});
  }, []);

  return (
    <section className="proof-panel">
      <div className="section-container">
        <div className="proof-grid">
          {stats.map((stat, i) => (
            <AnimatedStat
              key={stat._id}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
              delay={i * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

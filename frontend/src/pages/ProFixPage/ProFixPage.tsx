import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import { fetchProFixServices, fetchProFixCategories, type ProFixService as ApiService, type ProFixCategory as ApiCategory } from '../../api/proFix';
import { useProFixSearch } from '../../hooks/useProFixSearch';
import './ProFixPage.css';

const PHONE_TEL = 'tel:+919008855088';
const WHATSAPP = 'https://wa.me/919008855088';

const SERVICE_ICONS: Record<string, string> = {
  masonry: 'bricks',
  flooring: 'diamond',
  ceiling: 'building',
  painting: 'leaf',
  carpentry: 'wrench',
  exterior: 'store',
  electrical: 'star',
  plumbing: 'wrench',
  others: 'check-circle',
};

const TRUST_POINTS = [
  { id: 'verified', label: 'Verified professionals', icon: 'shield-check' },
  { id: 'pricing', label: 'Transparent pricing', icon: 'receipt' },
  { id: 'quality', label: 'Quality workmanship', icon: 'check-circle' },
  { id: 'support', label: 'Reliable support', icon: 'phone' },
] as const;

const PROCESS_STEPS = [
  { step: '01', title: 'Choose a Service', description: 'Select the work you need.' },
  { step: '02', title: 'Share Your Requirements', description: 'Tell us about your project.' },
  { step: '03', title: 'Get Your Estimate', description: 'Review the estimate and get the work started.' },
];

interface PageCategory {
  id: string;
  name: string;
  icon: string;
}

interface PageService {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  unit: string;
  startingPrice: string;
}

function adaptCategory(c: ApiCategory): PageCategory {
  return { id: c._id, name: c.name, icon: c.icon };
}

function adaptService(s: ApiService): PageService {
  return {
    id: s._id,
    name: s.name,
    category: s.category,
    description: s.description,
    imageUrl: s.image?.url,
    unit: s.unit,
    startingPrice: s.startingPrice,
  };
}

export default function ProFixPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useProFixSearch();
  const [services, setServices] = useState<PageService[]>([]);
  const [categories, setCategories] = useState<PageCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const trustRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const [trustVisible, setTrustVisible] = useState(false);
  const [howVisible, setHowVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchProFixServices({ active: true }),
      fetchProFixCategories({ active: true }),
    ])
      .then(([svcData, catData]) => {
        setServices(svcData.map(adaptService));
        setCategories(catData.map(adaptCategory));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setTrustVisible(true);
      setHowVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === trustRef.current) setTrustVisible(true);
            if (entry.target === howRef.current) setHowVisible(true);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    const t = trustRef.current;
    const h = howRef.current;
    if (t) observer.observe(t);
    if (h) observer.observe(h);

    return () => observer.disconnect();
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesCategory = !activeCategory || s.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      categories.some(
        (c) => c.id === s.category && c.name.toLowerCase().includes(q)
      );
    return matchesCategory && matchesSearch;
  });

  const handleViewService = useCallback((serviceId: string) => {
    navigate(`/pro-fix/${serviceId}`);
  }, [navigate]);

  return (
    <div className="profix-page">
      {/* ===== HERO ===== */}
      <section className="profix-hero">
        <HeroSlider />
      </section>

      {/* ===== SEARCH ===== */}
      <section className="profix-search">
        <div className="section-container">
          <div className="profix-search-wrap">
            <svg className="profix-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="profix-search-input"
              type="text"
              placeholder="Search Pro Fix services, e.g. plastering, flooring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search Pro Fix services"
            />
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="profix-categories">
        <div className="section-container">
          <div className="profix-section-header-text">
            <span className="profix-section-label">Browse</span>
            <h2 className="profix-section-title">Browse Services</h2>
          </div>
          <div className="profix-cat-grid" role="group" aria-label="Service categories">
            <button
              type="button"
              className={`profix-cat-tile ${!activeCategory ? 'profix-cat-tile--active' : ''}`}
              onClick={() => setActiveCategory(null)}
              aria-pressed={!activeCategory}
            >
              <span className="profix-cat-tile-icon">
                <Icon name="home" size={20} />
              </span>
              <span className="profix-cat-tile-name">All</span>
            </button>
            {categories.map((cat) => {
              const count = services.filter((s) => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`profix-cat-tile ${activeCategory === cat.id ? 'profix-cat-tile--active' : ''}`}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  aria-pressed={activeCategory === cat.id}
                >
                  <span className="profix-cat-tile-icon">
                    <Icon name={cat.icon} size={20} />
                  </span>
                  <span className="profix-cat-tile-name">{cat.name}</span>
                  {count > 0 && <span className="profix-cat-tile-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== POPULAR SERVICES ===== */}
      <section id="profix-services" className="profix-services">
        <div className="section-container">
          <div className="profix-section-header">
            <div className="profix-section-header-text">
              <span className="profix-section-label">Services</span>
              <h2 className="profix-section-title">Popular Pro Fix Services</h2>
            </div>
            <span className="profix-services-count">{filteredServices.length} services</span>
          </div>
          <div className="profix-services-grid">
            {filteredServices.map((svc) => (
              <article key={svc.id} className="profix-service-card">
                <div className="profix-service-img">
                  {svc.imageUrl ? (
                    <img
                      src={svc.imageUrl}
                      alt={svc.name}
                      className="profix-service-img-el"
                      loading="lazy"
                    />
                  ) : (
                    <Icon name={SERVICE_ICONS[svc.category] || 'building'} size={32} className="profix-service-img-icon" />
                  )}
                </div>
                <div className="profix-service-body">
                  <h3 className="profix-service-name">{svc.name}</h3>
                  <div className="profix-service-footer">
                    <span className="profix-service-price">
                      {svc.startingPrice
                        ? `From \u20B9${svc.startingPrice}`
                        : 'Contact for pricing'}
                    </span>
                    <button className="profix-service-cta" onClick={() => handleViewService(svc.id)} aria-label={`View ${svc.name}`}>
                      View
                      <Icon name="arrow-right" size={12} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filteredServices.length === 0 && (
            <div className="profix-services-empty">
              <p>No services match your search. Try a different term or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY PRO FIX ===== */}
      <section className="profix-trust" aria-label="Why Pro Fix">
        <div className="section-container">
          <div
            ref={trustRef}
            className={`profix-trust-inner ${trustVisible ? 'profix-trust-inner--visible' : ''}`}
          >
            <div className="profix-section-header-text profix-trust-heading">
              <span className="profix-section-label">Why Pro Fix</span>
            </div>
            <ul className="profix-trust-strip">
              {TRUST_POINTS.map((point, i) => (
                <li
                  key={point.id}
                  className="profix-trust-item"
                  style={{ transitionDelay: trustVisible ? `${i * 80}ms` : undefined }}
                >
                  <span className="profix-trust-icon">
                    <Icon name={point.icon} size={14} />
                  </span>
                  {point.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== HOW PRO FIX WORKS ===== */}
      <section className="profix-process">
        <div className="section-container">
          <div className="profix-section-header profix-section-header--center">
            <div className="profix-section-header-text">
              <span className="profix-section-label">Process</span>
              <h2 className="profix-section-title">How Pro Fix Works</h2>
            </div>
          </div>
          <div ref={howRef} className={`profix-process-steps ${howVisible ? 'profix-process-steps--visible' : ''}`}>
            <ol className="profix-process-steps-list">
              {PROCESS_STEPS.map((step, i) => (
                <li
                  key={step.step}
                  className="profix-process-step"
                  style={{ transitionDelay: howVisible ? `${i * 100}ms` : undefined }}
                >
                  <span className="profix-process-num">{step.step}</span>
                  <h3 className="profix-process-title">{step.title}</h3>
                  <p className="profix-process-desc">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ===== SUPPORT CTA ===== */}
      <section className="profix-expert">
        <div className="section-container">
          <div className="profix-expert-card">
            <h2 className="profix-expert-title">Need help choosing a service?</h2>
            <p className="profix-expert-tagline">Not sure where to start? We&apos;ll point you right.</p>
            <div className="profix-expert-actions">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="profix-expert-icon-btn"
                aria-label="Chat with us"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href={PHONE_TEL}
                className="profix-expert-icon-btn"
                aria-label="Call us"
              >
                <Icon name="phone" size={20} />
              </a>
            </div>
            <span className="profix-expert-available">
              <span className="profix-expert-dot" />
              Available Now
            </span>
          </div>
        </div>
      </section>

      {/* ===== MOBILE BOTTOM NAV SPACER ===== */}
      <div className="profix-bottom-spacer" />
    </div>
  );
}

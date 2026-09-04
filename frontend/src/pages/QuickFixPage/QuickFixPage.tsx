import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import QuickFixBannerCarousel from '../../components/QuickFixBannerCarousel/QuickFixBannerCarousel';
import {
  getQuickFixCategories,
  getQuickFixActiveServices,
  getQuickFixCategoryName,
  formatINR,
  formatQuickFixDuration,
} from '../../data/quickfix';
import { useQuickFixSearch } from '../../hooks/useQuickFixSearch';
import './QuickFixPage.css';

const PHONE_TEL = 'tel:+919008855088';
const WHATSAPP = 'https://wa.me/919008855088';

const TRUST_POINTS = [
  { id: 'verified', label: 'Verified professionals', icon: 'shield-check' },
  { id: 'pricing', label: 'Transparent pricing', icon: 'receipt' },
  { id: 'genuine', label: 'Genuine service', icon: 'check-circle' },
  { id: 'support', label: 'Reliable support', icon: 'phone' },
] as const;

const HOW_STEPS = [
  { step: '01', title: 'Choose a Service', description: 'Pick the service that matches your problem.' },
  { step: '02', title: 'Pick a Convenient Time', description: 'Choose a suitable time.' },
  { step: '03', title: "We'll Fix It", description: 'Our expert arrives and gets it fixed.' },
];

export default function QuickFixPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useQuickFixSearch();
  const [brokenImageIds, setBrokenImageIds] = useState<ReadonlySet<string>>(new Set());

  const trustRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const [trustVisible, setTrustVisible] = useState(false);
  const [howVisible, setHowVisible] = useState(false);

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

  const services = getQuickFixActiveServices();

  const filteredServices = services.filter((s) => {
    const matchesCategory = !activeCategory || s.categoryId === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      getQuickFixCategoryName(s.categoryId).toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setActiveCategory(categoryId);
    if (categoryId) {
      window.requestAnimationFrame(() => {
        document.getElementById('qf-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  const handleViewService = useCallback(
    (serviceId: string) => {
      navigate(`/quick-fix/${serviceId}`);
    },
    [navigate]
  );

  const handleImageError = useCallback((id: string) => {
    setBrokenImageIds((prev) => {
      if (prev.has(id)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(id);
      return nextSet;
    });
  }, []);

  return (
    <div className="qf-page">
      {/* ===== BANNER CAROUSEL ===== */}
      <section className="qf-hero">
        <QuickFixBannerCarousel onCategorySelect={handleCategorySelect} />
      </section>

      {/* ===== SEARCH ===== */}
      <section className="qf-search">
        <div className="section-container">
          <div className="qf-search-wrap">
            <svg className="qf-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="qf-search-input"
              type="text"
              placeholder="Search services, e.g. AC repair, RO service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search Quick Fix services"
            />
            {searchQuery && (
              <button
                type="button"
                className="qf-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY DISCOVERY ===== */}
      <section className="qf-categories">
        <div className="section-container">
          <div className="qf-section-header">
            <div className="qf-section-header-text">
              <span className="qf-section-label">Categories</span>
              <h2 className="qf-section-title">What needs fixing?</h2>
            </div>
          </div>
          <div className="qf-cat-grid" role="group" aria-label="Service categories">
            <button
              type="button"
              className={`qf-cat-tile ${!activeCategory ? 'qf-cat-tile--active' : ''}`}
              onClick={() => handleCategorySelect(null)}
              aria-pressed={!activeCategory}
            >
              <span className="qf-cat-tile-icon">
                <Icon name="home" size={20} />
              </span>
              <span className="qf-cat-tile-name">All</span>
            </button>
            {getQuickFixCategories()
              .filter((c) => c.active)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((cat) => {
                const count = services.filter((s) => s.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`qf-cat-tile ${activeCategory === cat.id ? 'qf-cat-tile--active' : ''}`}
                    onClick={() => handleCategorySelect(activeCategory === cat.id ? null : cat.id)}
                    aria-pressed={activeCategory === cat.id}
                  >
                    <span className="qf-cat-tile-icon">
                      <Icon name={cat.icon} size={20} />
                    </span>
                    <span className="qf-cat-tile-name">{cat.name}</span>
                    {count > 0 && <span className="qf-cat-tile-badge">{count}</span>}
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* ===== POPULAR SERVICES ===== */}
      <section id="qf-services" className="qf-services">
        <div className="section-container">
          <div className="qf-section-header qf-section-header--row">
            <div className="qf-section-header-text">
              <span className="qf-section-label">Services</span>
              <h2 className="qf-section-title">Popular Quick Fix Services</h2>
            </div>
            <span className="qf-services-count">{filteredServices.length} services</span>
          </div>
          <div className="qf-services-grid">
            {filteredServices.map((svc) => {
              const category = getQuickFixCategories().find((c) => c.id === svc.categoryId);
              const price = svc.pricing.enabled ? formatINR(svc.pricing.price ?? 0) : null;
              const duration = formatQuickFixDuration(svc.duration);
              return (
                <article key={svc.id} className="qf-service-card">
                  <div className="qf-service-img">
                    {svc.image && !brokenImageIds.has(svc.id) ? (
                      <img
                        src={svc.image}
                        alt={svc.name}
                        className="qf-service-img-el"
                        loading="lazy"
                        onError={() => handleImageError(svc.id)}
                      />
                    ) : (
                      <span className="qf-service-img-fallback">
                        <Icon name={category?.icon ?? 'wrench'} size={28} />
                      </span>
                    )}
                    {svc.featured && <span className="qf-service-flag">Popular</span>}
                  </div>
                  <div className="qf-service-body">
                    <h3 className="qf-service-name">{svc.name}</h3>
                    <p className="qf-service-desc">{svc.shortDescription}</p>
                    <div className="qf-service-footer">
                      <span className="qf-service-meta">
                        {price && <span className="qf-service-price">{price}</span>}
                        {duration && <span className="qf-service-duration">{duration}</span>}
                      </span>
                      <button
                        type="button"
                        className="qf-service-cta"
                        onClick={() => handleViewService(svc.id)}
                        aria-label={`View ${svc.name}`}
                      >
                        View
                        <Icon name="arrow-right" size={12} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {filteredServices.length === 0 && (
            <div className="qf-services-empty">
              <p>No services match your search. Try a different term or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== TRUST / ASSURANCE ===== */}
      <section className="qf-trust" aria-label="Why Quick Fix">
        <div className="section-container">
          <div
            ref={trustRef}
            className={`qf-trust-inner ${trustVisible ? 'qf-trust-inner--visible' : ''}`}
          >
            <div className="qf-section-header-text qf-trust-heading">
              <span className="qf-section-label">Why Vijaya Siri</span>
            </div>
            <ul className="qf-trust-strip">
              {TRUST_POINTS.map((point, i) => (
                <li
                  key={point.id}
                  className="qf-trust-item"
                  style={{ transitionDelay: trustVisible ? `${i * 80}ms` : undefined }}
                >
                  <span className="qf-trust-icon">
                    <Icon name={point.icon} size={14} />
                  </span>
                  {point.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== HOW QUICK FIX WORKS ===== */}
      <section className="qf-how">
        <div className="section-container">
          <div className="qf-section-header qf-section-header--center">
            <div className="qf-section-header-text">
              <span className="qf-section-label">Process</span>
              <h2 className="qf-section-title">How Quick Fix Works</h2>
            </div>
          </div>
          <div ref={howRef} className={`qf-how-steps ${howVisible ? 'qf-how-steps--visible' : ''}`}>
            <ol className="qf-how-steps-list">
              {HOW_STEPS.map((step, i) => (
                <li
                  key={step.step}
                  className="qf-how-step"
                  style={{ transitionDelay: howVisible ? `${i * 100}ms` : undefined }}
                >
                  <span className="qf-how-num">{step.step}</span>
                  <h3 className="qf-how-title">{step.title}</h3>
                  <p className="qf-how-desc">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ===== EXPERT HELP ===== */}
      <section className="qf-expert">
        <div className="section-container">
          <div className="qf-expert-card">
            <h2 className="qf-expert-title">Not sure what you need?</h2>
            <p className="qf-expert-tagline">We&apos;ll help you choose the right service.</p>
            <div className="qf-expert-actions">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="qf-expert-icon-btn"
                aria-label="Chat with us"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a href={PHONE_TEL} className="qf-expert-icon-btn" aria-label="Call us">
                <Icon name="phone" size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE BOTTOM NAV SPACER ===== */}
      <div className="qf-bottom-spacer" />
    </div>
  );
}

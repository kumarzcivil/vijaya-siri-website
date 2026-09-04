import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { useIsFeatureEnabled } from '../../hooks/useSiteControl';
import type { SiteFeature } from '../../data/siteControl';
import './HomePage.css';

interface Service {
  id: string;
  icon: 'building' | 'wrench' | 'armchair';
  title: string;
  subtitle: string;
  copy: string;
  cta: string;
  ctaTarget: string;
  primary: boolean;
  feature: SiteFeature;
}

const SERVICES: Service[] = [
  {
    id: 'construct',
    icon: 'building',
    title: 'CONSTRUCT',
    subtitle: 'Build New Homes',
    copy: 'From the ground up.',
    cta: 'Explore Construct',
    ctaTarget: '/projects?category=construction',
    primary: true,
    feature: 'projects',
  },
  {
    id: 'pro-fix',
    icon: 'wrench',
    title: 'PRO FIX',
    subtitle: 'Transform & Upgrade',
    copy: 'Renovate with expertise.',
    cta: 'Explore Pro Fix',
    ctaTarget: '/pro-fix',
    primary: false,
    feature: 'proFix',
  },
  {
    id: 'quick-fix',
    icon: 'armchair',
    title: 'QUICK FIX',
    subtitle: 'Repair & Maintain',
    copy: 'Small fixes. Big difference.',
    cta: 'Explore Quick Fix',
    ctaTarget: '/quick-fix',
    primary: false,
    feature: 'quickFix',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const projectsEnabled = useIsFeatureEnabled('projects');
  const proFixEnabled = useIsFeatureEnabled('proFix');
  const quickFixEnabled = useIsFeatureEnabled('quickFix');
  const quoteEnabled = useIsFeatureEnabled('quote');
  const [servicesVisible, setServicesVisible] = useState(false);
  const featureEnabled: Record<SiteFeature, boolean> = {
    home: true,
    projects: projectsEnabled,
    packages: true,
    proFix: proFixEnabled,
    quickFix: quickFixEnabled,
    about: true,
    quote: quoteEnabled,
    account: true,
    offers: true,
  };
  const visibleServices = SERVICES.filter((svc) => featureEnabled[svc.feature]);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setServicesVisible(true);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setServicesVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setServicesVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (servicesRef.current) {
      observer.observe(servicesRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleGetQuote = useCallback(() => {
    navigate('/quote');
  }, [navigate]);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="section-container">
          <div className="home-hero-inner">
            <span className="home-hero-eyebrow">Welcome to Vijaya Siri</span>
            <h1 className="home-hero-title">
              <span className="home-hero-title-navy">Building Trust,</span>
              <br />
              <span className="home-hero-title-orange">Crafting Homes.</span>
            </h1>
            <div className="home-hero-accent" />
            <p className="home-hero-desc">
              From concept to completion, we help you build spaces you&apos;ll love for life.
            </p>
            {featureEnabled.quote && (
              <div className="home-hero-actions">
                <button className="home-hero-cta" onClick={handleGetQuote}>
                  Get Free Quote
                  <Icon name="arrow-right" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="home-services" id="home-services" ref={servicesRef}>
        <div className="section-container">
          <div className={`home-services-header ${servicesVisible ? 'home-services-header--visible' : ''}`}>
            <span className="home-services-label">Our Services</span>
            <h2 className="home-services-title">Three services. One promise — Quality Homes.</h2>
            <div className="home-services-accent" />
          </div>

          <div className="home-services-grid">
            {visibleServices.map((svc, i) => (
              <div
                key={svc.id}
                className={`home-service-card ${svc.primary ? 'home-service-card--primary' : ''} ${servicesVisible ? 'home-service-card--visible' : ''}`}
                style={{ transitionDelay: `${350 + i * 80}ms` }}
              >
                <div className="home-service-card-content">
                  <div className={`home-service-icon ${svc.primary ? 'home-service-icon--primary' : ''}`}>
                    <Icon name={svc.icon} size={40} />
                  </div>
                  <h3 className="home-service-title">{svc.title}</h3>
                  <p className="home-service-subtitle">{svc.subtitle}</p>
                  <p className="home-service-copy">{svc.copy}</p>
                </div>
                <button
                  className={`home-service-cta ${svc.primary ? 'home-service-cta--primary' : ''}`}
                  onClick={() => navigate(svc.ctaTarget)}
                >
                  {svc.cta}
                  <span className="home-service-cta-arrow">
                    <Icon name="arrow-right" size={16} />
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

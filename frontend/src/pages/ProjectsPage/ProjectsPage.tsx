import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivePackagesAPI, type Package } from '../../api/packages';
import { getProjectsAPI, type Project } from '../../api/projects';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import Hero from '../../components/Hero/Hero';
import Statistics from '../../components/Statistics/Statistics';
import PackageCard from '../../components/PackageCard/PackageCard';
import PackageSlider from '../../components/PackageSlider/PackageSlider';
import DiscoverServices from '../../components/DiscoverServices/DiscoverServices';
import FeaturedCarousel from '../../components/FeaturedCarousel/FeaturedCarousel';
import Roadmap from '../../components/Roadmap/Roadmap';
import QuoteCTA from '../../components/QuoteCTA/QuoteCTA';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const [selectedPackage] = useState<string>('premium');
  const [apiProjects, setApiProjects] = useState<Project[]>([]);
  const [apiPkgs, setApiPkgs] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const featuredProjects = apiProjects
    .filter((p) => p.featured)
    .map((p) => ({
      id: p._id,
      name: p.name,
      location: p.location,
      city: p.city,
      type: p.type,
      size: p.size,
      bedrooms: p.bedrooms,
      status: p.status,
      statusLabel: p.status === 'completed' ? 'Completed' : p.status === 'in-progress' ? 'In Progress' : 'Upcoming',
      rating: p.rating,
      imageUrl: p.imageUrl,
      features: [p.bedrooms, p.type, p.size].filter(Boolean),
      tags: p.tags,
      featured: p.featured,
      displayOrder: p.displayOrder,
    }));
  const packages = apiPkgs
    .filter((p) => p.status === 'active')
    .map((p) => ({
      id: p._id,
      name: p.name,
      comparisonName: p.comparisonName || p.name,
      description: p.description,
      price: p.pricePerSqFt,
      pricePrefix: p.pricePrefix || '₹',
      priceUnit: p.priceUnit || 'per sq.ft',
      features: p.features || [],
      popular: p.popular || p.isDefault,
      active: true,
      icon: p.icon || 'home',
      displayOrder: p.priority || 0,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getProjectsAPI().catch(() => ({ success: false, data: { projects: [] } })),
      getActivePackagesAPI().catch(() => []),
    ]).then(([projRes, pkgRes]) => {
      if (projRes.success && projRes.data) {
        setApiProjects(projRes.data.projects);
      }
      if (Array.isArray(pkgRes)) {
        setApiPkgs(pkgRes);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="projects-page">
      <Breadcrumb />

      <Hero />

      <Statistics />

      <section className="projects-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-header-text">
              <span className="section-label">Our Packages</span>
              <h2 className="section-title">Simple Choices. Beautiful Homes.</h2>
              <p className="section-subtitle">
                From essential builds to luxury homes — select the package that matches
                your vision and budget. Every package includes quality materials and
                expert craftsmanship.
              </p>
            </div>
            <button
              type="button"
              className="section-view-all"
              onClick={() => navigate('/projects/compare-packages')}
            >
              Compare All Packages
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <div id="packages">
            <PackageSlider>
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedPackage === pkg.id}
                  onSelect={() => {}}
                />
              ))}
            </PackageSlider>
          </div>
        </div>
      </section>

      <section className="projects-section projects-section--alt">
        <div className="section-container">
          <div className="section-header">
            <div className="section-header-text">
              <span className="section-label">Discover Services</span>
              <h2 className="section-title">What we can build for you</h2>
              <p className="section-subtitle">
                Explore our construction and development services, from new homes
                and renovations to interiors and civil works.
              </p>
            </div>
          </div>
          <DiscoverServices />
        </div>
      </section>

      <section className="projects-section" id="featured-projects">
        <div className="section-container">
          <div className="section-header">
            <div className="section-header-text">
              <span className="section-label">Our Work</span>
              <h2 className="section-title">Featured Residential Projects</h2>
              <p className="section-subtitle">
                Explore our portfolio of completed and ongoing residential construction
                projects across Siruguppa, Adoni and Sindhanur.
              </p>
            </div>
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading projects...</p>
          ) : featuredProjects.length > 0 ? (
            <FeaturedCarousel projects={featuredProjects} />
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>No featured projects yet.</p>
          )}
        </div>
      </section>

      <section className="projects-section projects-section--alt">
        <div className="section-container">
          <div className="section-header section-header--center">
            <div className="section-header-text">
              <span className="section-label">Our Process</span>
              <h2 className="section-title">Building Your Home — Our Roadmap</h2>
              <p className="section-subtitle">
                From first conversation to final handover — here is how we bring
                your dream home to life, one step at a time.
              </p>
            </div>
          </div>
          <Roadmap />
        </div>
      </section>

      <QuoteCTA />
    </div>
  );
}

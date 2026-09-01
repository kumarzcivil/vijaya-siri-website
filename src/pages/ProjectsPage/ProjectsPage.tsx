import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPackages, getFeaturedProjects } from '../../data';
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
  const featuredProjects = getFeaturedProjects();
  const packages = getPackages()
    .filter((p) => p.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const navigate = useNavigate();

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
          <FeaturedCarousel projects={featuredProjects} />
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

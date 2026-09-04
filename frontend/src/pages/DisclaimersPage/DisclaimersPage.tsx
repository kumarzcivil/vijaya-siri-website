import { useEffect, useRef } from 'react';
import './DisclaimersPage.css';

export default function DisclaimersPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('.disclaimer-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('disclaimer-section--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="disclaimers-page">
      {/* ======================== HERO ======================== */}
      <section className="disclaimer-hero">
        <div className="section-container">
          <div className="disclaimer-hero-inner">
            <span className="disclaimer-eyebrow">Disclaimers</span>
            <h1 className="disclaimer-hero-heading">
              Important information,<br />clearly explained.
            </h1>
            <p className="disclaimer-hero-description">
              Please review the following information to understand how website
              content, package pricing, project information and estimates should
              be interpreted.
            </p>
          </div>
        </div>
      </section>

      {/* ======================== SECTIONS ======================== */}
      <div className="disclaimer-sections" ref={containerRef}>
        <div className="section-container">

          {/* 01 — Website Information */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">01</span>
              <h2 className="disclaimer-section-title">Website Information</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Information on this website is provided for general informational purposes. While Vijaya Siri aims to keep information accurate and current, specifications, prices, availability, images and other details may change from time to time.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 02 — Package Prices & Estimates */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">02</span>
              <h2 className="disclaimer-section-title">Package Prices &amp; Estimates</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Package prices and per sq.ft. rates displayed on the website are indicative unless specifically confirmed in a project quotation.</p>
              <p>Final pricing may vary based on project scope, built-up area, design, material selections, site conditions and other requirements.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 03 — Project Information */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">03</span>
              <h2 className="disclaimer-section-title">Project Information</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Project photographs, illustrations, specifications and examples are intended to demonstrate the nature and quality of our work.</p>
              <p>Actual results may vary depending on design, materials, site conditions and customer requirements.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 04 — Material Availability */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">04</span>
              <h2 className="disclaimer-section-title">Material Availability</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Specified brands, products, colours, finishes and materials may be subject to availability.</p>
              <p>Where necessary, an equivalent alternative may be proposed, subject to the applicable project terms and customer approval.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 05 — Project Timelines */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">05</span>
              <h2 className="disclaimer-section-title">Project Timelines</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Project timelines displayed or communicated are estimates based on the agreed scope and prevailing circumstances.</p>
              <p>Delays may occur due to approvals, material availability, site conditions, customer changes, weather or circumstances beyond reasonable control.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 06 — Site Conditions */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">06</span>
              <h2 className="disclaimer-section-title">Site Conditions</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Website information cannot account for every site-specific condition.</p>
              <p>Final construction requirements and costs are determined after appropriate site assessment, drawings, specifications and project review.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 07 — Third-Party Links */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">07</span>
              <h2 className="disclaimer-section-title">Third-Party Links</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Our website may contain links to third-party websites or services.</p>
              <p>Vijaya Siri does not control those websites and is not responsible for their content, availability or privacy practices.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 08 — Website Availability */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">08</span>
              <h2 className="disclaimer-section-title">Website Availability</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>We make reasonable efforts to keep the website available and functioning correctly.</p>
              <p>Temporary interruptions may occur because of maintenance, technical problems, hosting issues or circumstances beyond our reasonable control.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 09 — Using Website Information */}
          <section className="disclaimer-section">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">09</span>
              <h2 className="disclaimer-section-title">Using Website Information</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Website information should not be treated as a substitute for a project-specific quotation, architectural or engineering assessment, approved drawing, agreement or other project documentation.</p>
            </div>
          </section>

          <div className="disclaimer-divider" />

          {/* 10 — Final Project Documents */}
          <section className="disclaimer-section disclaimer-section--final">
            <div className="disclaimer-section-header">
              <span className="disclaimer-section-number">10</span>
              <h2 className="disclaimer-section-title">Final Project Documents</h2>
            </div>
            <div className="disclaimer-section-body">
              <p>Where there is any difference between information displayed on the website and the approved project quotation, drawings, specifications or agreement, the applicable approved project documentation will govern the project.</p>
            </div>
          </section>

        </div>
      </div>

      {/* ======================== CLOSING ======================== */}
      <section className="disclaimer-closing">
        <div className="section-container">
          <p className="disclaimer-closing-text">
            Vijaya Siri aims to provide clear, useful and up-to-date information
            so customers can make informed decisions about their projects.
          </p>
        </div>
      </section>
    </div>
  );
}

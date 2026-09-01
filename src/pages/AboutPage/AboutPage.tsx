import { useEffect, useRef } from 'react';
import './AboutPage.css';

const PHONE_TEL = 'tel:+919008855088';

const principles = [
  {
    number: '01',
    title: 'Clarity',
    description: 'Good decisions begin with understanding.',
  },
  {
    number: '02',
    title: 'Integrity',
    description: 'Trust is earned through consistency.',
  },
  {
    number: '03',
    title: 'Craft',
    description: 'The details define the finished home.',
  },
];

export default function AboutPage() {
  const principleRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('about-principle--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
    );

    principleRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      {/* ======================== HERO ======================== */}
      <section className="about-hero">
        <div className="section-container">
          <div className="about-hero-inner">
            <span className="about-eyebrow">About Vijaya Siri</span>
            <h1 className="about-hero-heading">
              Building with<br />intention.
            </h1>
            <p className="about-hero-statement">
              A home should be thoughtfully planned, clearly understood and built
              with purpose.
            </p>
            <p className="about-hero-description">
              Vijaya Siri is being shaped around a simpler way of approaching
              home-related decisions — bringing clarity, expertise and dependable
              people together under one name.
            </p>
          </div>

          {/* Hero visual — architectural linework */}
          <div className="about-hero-visual" aria-hidden="true">
            <div className="about-arch-lines">
              <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="about-arch-svg">
                {/* Floor plan inspired linework */}
                <line x1="60" y1="40" x2="340" y2="40" className="about-arch-line about-arch-line--main" />
                <line x1="60" y1="40" x2="60" y2="260" className="about-arch-line about-arch-line--main" />
                <line x1="340" y1="40" x2="340" y2="260" className="about-arch-line about-arch-line--main" />
                <line x1="60" y1="260" x2="340" y2="260" className="about-arch-line about-arch-line--main" />

                {/* Inner walls */}
                <line x1="60" y1="130" x2="220" y2="130" className="about-arch-line about-arch-line--inner" />
                <line x1="220" y1="40" x2="220" y2="200" className="about-arch-line about-arch-line--inner" />
                <line x1="140" y1="130" x2="140" y2="260" className="about-arch-line about-arch-line--inner" />

                {/* Door openings */}
                <line x1="220" y1="200" x2="220" y2="200" className="about-arch-line about-arch-line--door" strokeWidth="3" />
                <line x1="140" y1="180" x2="140" y2="180" className="about-arch-line about-arch-line--door" strokeWidth="3" />

                {/* Accent corner mark */}
                <line x1="50" y1="30" x2="70" y2="30" className="about-arch-line about-arch-line--accent" />
                <line x1="50" y1="30" x2="50" y2="50" className="about-arch-line about-arch-line--accent" />
                <line x1="330" y1="250" x2="350" y2="250" className="about-arch-line about-arch-line--accent" />
                <line x1="350" y1="230" x2="350" y2="250" className="about-arch-line about-arch-line--accent" />

                {/* Dimension lines */}
                <line x1="60" y1="275" x2="340" y2="275" className="about-arch-line about-arch-line--dim" />
                <line x1="60" y1="270" x2="60" y2="280" className="about-arch-line about-arch-line--dim" />
                <line x1="340" y1="270" x2="340" y2="280" className="about-arch-line about-arch-line--dim" />

                {/* Small cross mark */}
                <line x1="190" y1="80" x2="210" y2="80" className="about-arch-line about-arch-line--accent" />
                <line x1="200" y1="70" x2="200" y2="90" className="about-arch-line about-arch-line--accent" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== WHY VIJAYA SIRI ======================== */}
      <section className="about-why">
        <div className="section-container">
          <div className="about-why-inner">
            <span className="about-eyebrow">Why Vijaya Siri?</span>
            <h2 className="about-why-heading">
              Because building a home should feel simpler.
            </h2>
            <p className="about-why-copy">
              Behind every home is a collection of decisions — what to build,
              whom to trust, what it should cost and how it should come together.
            </p>
            <p className="about-why-copy">
              Vijaya Siri was created to make those decisions more straightforward.
            </p>
            <div className="about-why-statements">
              <p className="about-why-statement">Less uncertainty.</p>
              <p className="about-why-statement">Better decisions.</p>
              <p className="about-why-statement">A more considered experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== WHAT WE BELIEVE ======================== */}
      <section className="about-believe">
        <div className="section-container">
          <span className="about-eyebrow">What We Believe</span>
          <div className="about-believe-grid">
            {principles.map((p, i) => (
              <article
                key={p.number}
                className="about-principle"
                ref={(el) => { principleRefs.current[i] = el; }}
              >
                <span className="about-principle-number">{p.number}</span>
                <h3 className="about-principle-title">{p.title}</h3>
                <p className="about-principle-desc">{p.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== OUR DIRECTION ======================== */}
      <section className="about-direction">
        <div className="section-container">
          <div className="about-direction-inner">
            <span className="about-eyebrow">Our Direction</span>
            <h2 className="about-direction-heading">
              From a local idea<br />to a trusted name.
            </h2>
            <p className="about-direction-copy">
              Vijaya Siri is starting with a simple ambition: to become a name
              people can confidently turn to when making decisions about their homes.
            </p>
            <div className="about-direction-lines">
              <p>Beginning locally.</p>
              <p>Growing thoughtfully.</p>
              <p>Building for the long term.</p>
            </div>
            <p className="about-direction-location">
              Starting locally, with a growing vision.
            </p>
          </div>
        </div>
      </section>

      {/* ======================== OUR VISION ======================== */}
      <section className="about-vision">
        <div className="section-container">
          <div className="about-vision-inner">
            <span className="about-eyebrow about-eyebrow--light">Our Vision</span>
            <blockquote className="about-vision-quote">
              We want to make the experience of building and caring for a home feel
              more human, more transparent and more dependable.
            </blockquote>
            <cite className="about-vision-cite">— VIJAYA SIRI</cite>
          </div>
        </div>
      </section>

      {/* ======================== FINAL CTA ======================== */}
      <section className="about-cta">
        <div className="section-container">
          <div className="about-cta-inner">
            <span className="about-eyebrow">Start With an Idea</span>
            <h2 className="about-cta-heading">Have an idea in mind?</h2>
            <p className="about-cta-copy">Let's start there.</p>
            <a href={PHONE_TEL} className="about-cta-btn">
              Get in Touch
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

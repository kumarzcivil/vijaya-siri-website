import { useMemo } from 'react';
import { getActiveOffers } from '../../data/offers';
import OfferCard from '../../components/OfferCard/OfferCard';
import QuoteCTA from '../../components/QuoteCTA/QuoteCTA';
import { useIsFeatureEnabled } from '../../hooks/useSiteControl';
import './OffersPage.css';

export default function OffersPage() {
  const activeOffers = useMemo(() => getActiveOffers(), []);
  const quoteEnabled = useIsFeatureEnabled('quote');

  return (
    <div className="offers-page">
      <section className="offers-hero">
        <div className="section-container">
          <span className="section-label">Offers</span>
          <h1 className="offers-hero-title">Current Offers &amp; Special Opportunities</h1>
          <p className="offers-hero-subtitle">
            Explore current promotional opportunities from the Vijaya Siri team.
            Speak with our experts to plan your next construction project.
          </p>
        </div>
      </section>

      <section className="offers-section">
        <div className="section-container">
          {activeOffers.length > 0 ? (
            <div className="offers-grid">
              {activeOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="offers-empty">
              <h2 className="offers-empty-title">No current offers</h2>
              <p className="offers-empty-text">
                Please check back soon for new offers.
              </p>
            </div>
          )}
        </div>
      </section>

      {quoteEnabled && <QuoteCTA />}
    </div>
  );
}

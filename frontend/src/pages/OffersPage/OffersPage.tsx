import { useState, useEffect } from 'react';
import { fetchOffers, type Offer } from '../../api/offers';
import OfferCard from '../../components/OfferCard/OfferCard';
import QuoteCTA from '../../components/QuoteCTA/QuoteCTA';
import { useIsFeatureEnabled } from '../../hooks/useSiteControl';
import './OffersPage.css';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const quoteEnabled = useIsFeatureEnabled('quote');

  useEffect(() => {
    fetchOffers()
      .then((data) => setOffers(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

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
          {loading ? (
            <div className="offers-empty">
              <p className="offers-empty-text">Loading offers...</p>
            </div>
          ) : error ? (
            <div className="offers-empty">
              <h2 className="offers-empty-title">Unable to load offers</h2>
              <p className="offers-empty-text">
                Please check back soon for new offers.
              </p>
            </div>
          ) : offers.length > 0 ? (
            <div className="offers-grid">
              {offers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
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

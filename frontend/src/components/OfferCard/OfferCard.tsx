import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Offer } from '../../api/offers';
import { useIsFeatureEnabled } from '../../hooks/useSiteControl';
import './OfferCard.css';

function formatDate(isoDate: string): string {
  const key = isoDate.slice(0, 10);
  if (!key) return isoDate;
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function validityLabel(offer: Offer): string | null {
  const hasStart = !!offer.startDate?.slice(0, 10);
  const hasEnd = !!offer.endDate?.slice(0, 10);
  if (hasStart && hasEnd) {
    return `Valid ${formatDate(offer.startDate)} – ${formatDate(offer.endDate)}`;
  }
  if (hasStart) return `Available from ${formatDate(offer.startDate)}`;
  if (hasEnd) return `Available until ${formatDate(offer.endDate)}`;
  return null;
}

export default function OfferCard({ offer }: { offer: Offer }) {
  const navigate = useNavigate();
  const [brokenImage, setBrokenImage] = useState(false);
  const quoteEnabled = useIsFeatureEnabled('quote');

  const isQuoteTarget = offer.ctaTarget?.trim() === '/quote';

  const hasDestination =
    !!offer.ctaTarget?.trim() &&
    !(isQuoteTarget && !quoteEnabled);

  const handleCta = useCallback(() => {
    const target = offer.ctaTarget?.trim();
    if (!target) return;
    if (target.startsWith('http')) {
      window.open(target, '_blank', 'noopener,noreferrer');
    } else {
      navigate(target);
    }
  }, [offer.ctaTarget, navigate]);

  const validity = validityLabel(offer);
  const imageSrc = offer.image || '';

  return (
    <article className="offer-card">
      <div className="offer-card-media">
        {brokenImage || !imageSrc ? (
          <div className="offer-card-fallback" role="img" aria-label={offer.title} />
        ) : (
          <img
            src={imageSrc}
            alt={offer.title}
            draggable={false}
            loading="lazy"
            onError={() => setBrokenImage(true)}
          />
        )}
        {offer.badge && <span className="offer-card-eyebrow">{offer.badge}</span>}
      </div>

      <div className="offer-card-body">
        <h3 className="offer-card-title">{offer.title}</h3>
        {offer.description && (
          <p className="offer-card-description">{offer.description}</p>
        )}
        {validity && <p className="offer-card-validity">{validity}</p>}
        {hasDestination && offer.ctaLabel && (
          <button
            type="button"
            className="offer-card-cta"
            onClick={handleCta}
          >
            {offer.ctaLabel}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}

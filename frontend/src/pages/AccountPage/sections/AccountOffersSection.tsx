import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AccountSectionHeader from '../AccountSectionHeader';
import { fetchOffers, type Offer as ApiOffer } from '../../../api/offers';
import { COUPONS } from '../../../data/coupons';

type UIOffer = {
  id: string;
  title: string;
  description: string;
  eyebrow: string;
  ctaLabel: string;
  ctaTarget: string;
};

function adaptOffer(api: ApiOffer): UIOffer {
  return {
    id: api._id,
    title: api.title,
    description: api.description,
    eyebrow: api.badge || '',
    ctaLabel: api.ctaLabel,
    ctaTarget: api.ctaTarget,
  };
}

function formatCouponDiscount(coupon: { discountType: string; discountValue: number; maximumDiscount?: number }): string {
  if (coupon.discountType === 'PERCENTAGE') {
    const base = `${coupon.discountValue}% off`;
    return coupon.maximumDiscount ? `${base} (up to ₹${coupon.maximumDiscount})` : base;
  }
  return `₹${coupon.discountValue} off`;
}

export default function AccountOffersSection() {
  const [offers, setOffers] = useState<UIOffer[]>([]);

  useEffect(() => {
    fetchOffers()
      .then((data) => {
        setOffers(
          data
            .filter((o) => o.status === 'active')
            .map(adaptOffer)
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Deals & Promotions"
        title="Offers & Coupons"
        description="Browse active offers and promo codes you can use at checkout."
      />

      {COUPONS.length > 0 && (
        <div className="acc-coupons">
          {COUPONS.map((coupon) => (
            <article key={coupon.code} className="acc-coupon-card">
              <div className="acc-coupon-code">{coupon.code}</div>
              <div className="acc-coupon-body">
                <h3 className="acc-coupon-title">{formatCouponDiscount(coupon)}</h3>
                <p className="acc-coupon-desc">{coupon.label}</p>
                <p className="acc-coupon-min">Minimum booking ₹{coupon.minimumBookingAmount}</p>
              </div>
              <span className="acc-coupon-service">
                {coupon.applicableService === 'BOTH' ? 'All services' : coupon.applicableService.replace(/_/g, ' ')}
              </span>
            </article>
          ))}
        </div>
      )}

      <div className="acc-offers-section">
        <h2 className="acc-offers-subtitle">Current Offers</h2>
        {offers.length === 0 ? (
          <div className="acc-empty">
            <p className="acc-empty-text">No active offers right now. Check back soon.</p>
          </div>
        ) : (
          <div className="acc-offers-list">
            {offers.map((offer) => (
              <article key={offer.id} className="acc-offer-card">
                {offer.eyebrow && <span className="acc-offer-eyebrow">{offer.eyebrow}</span>}
                <h3 className="acc-offer-title">{offer.title}</h3>
                <p className="acc-offer-desc">{offer.description}</p>
                <Link to={offer.ctaTarget} className="acc-offer-cta">
                  {offer.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

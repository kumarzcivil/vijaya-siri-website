import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AccountSectionHeader from '../AccountSectionHeader';
import { fetchOffers, type Offer as ApiOffer } from '../../../api/offers';
import { fetchActiveCoupons, type Coupon as ApiCoupon } from '../../../api/coupons';
import { SkeletonCard } from '../../../components/Skeleton/Skeleton';
import { logger } from '../../../utils/logger';
import './AccountOffersSection.css';

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

function adaptCoupon(c: ApiCoupon) {
  return {
    code: c.code,
    label: c.description || (c.discountType === 'percentage' ? `${c.discountValue}% off` : `\u20B9${c.discountValue} off`),
    discountType: c.discountType === 'percentage' ? 'PERCENTAGE' : 'FIXED',
    discountValue: c.discountValue,
    maxDiscount: c.maxDiscount,
    minOrder: c.minOrder,
    serviceType: c.serviceType,
    endDate: c.endDate,
  };
}

function formatCouponDiscount(coupon: { discountType: string; discountValue: number; maxDiscount?: number }): string {
  if (coupon.discountType === 'PERCENTAGE') {
    const base = `${coupon.discountValue}% off`;
    return coupon.maxDiscount ? `${base} (up to \u20B9${coupon.maxDiscount})` : base;
  }
  return `\u20B9${coupon.discountValue} off`;
}

export default function AccountOffersSection() {
  const [offers, setOffers] = useState<UIOffer[]>([]);
  const [coupons, setCoupons] = useState<ReturnType<typeof adaptCoupon>[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  useEffect(() => {
    logger.info('AccountOffers', 'Fetching active offers...');
    fetchOffers()
      .then((data) => {
        const adapted = data.filter((o) => o.status === 'active').map(adaptOffer);
        setOffers(adapted);
        logger.success('AccountOffers', `Loaded ${adapted.length} offers`);
      })
      .catch((err) => {
        logger.error('AccountOffers', 'Failed to load offers', err);
      })
      .finally(() => setLoadingOffers(false));
  }, []);

  useEffect(() => {
    logger.info('AccountOffers', 'Fetching active coupons...');
    fetchActiveCoupons()
      .then((data) => {
        const adapted = data.map(adaptCoupon);
        setCoupons(adapted);
        logger.success('AccountOffers', `Loaded ${adapted.length} coupons`);
      })
      .catch((err) => {
        logger.error('AccountOffers', 'Failed to load coupons', err);
      })
      .finally(() => setLoadingCoupons(false));
  }, []);

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Deals & Promotions"
        title="Offers & Coupons"
        description="Browse active offers and promo codes you can use at checkout."
      />

      {loadingCoupons ? (
        <div className="acc-coupons">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : coupons.length > 0 && (
        <div className="acc-coupons">
          {coupons.map((coupon) => (
            <article key={coupon.code} className="acc-coupon-card">
              <div className="acc-coupon-code">{coupon.code}</div>
              <div className="acc-coupon-body">
                <h3 className="acc-coupon-title">{formatCouponDiscount(coupon)}</h3>
                <p className="acc-coupon-desc">{coupon.label}</p>
                {coupon.minOrder > 0 && <p className="acc-coupon-min">Minimum booking \u20B9{coupon.minOrder}</p>}
                {coupon.endDate && (
                  <p className="acc-coupon-min">Valid until {new Date(coupon.endDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
              </div>
              <span className="acc-coupon-service">
                {coupon.serviceType === 'BOTH' ? 'All services' : coupon.serviceType.replace(/_/g, ' ')}
              </span>
            </article>
          ))}
        </div>
      )}

      <div className="acc-offers-section">
        <h2 className="acc-offers-subtitle">Current Offers</h2>
        {loadingOffers ? (
          <div className="acc-offers-list">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : offers.length === 0 ? (
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

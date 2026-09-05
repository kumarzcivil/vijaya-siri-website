import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import {
  fetchProFixServices,
  fetchProFixCategories,
  type ProFixService as ApiService,
  type ProFixCategory as ApiCategory,
} from '../../api/proFix';
import './ProFixServiceDetailPage.css';

const WHATSAPP = 'https://wa.me/919008855088';

const TRUST_ITEMS = [
  { id: 'verified', icon: 'shield-check' },
  { id: 'pricing', icon: 'receipt' },
  { id: 'ontime', icon: 'clock' },
] as const;

const proFixBenefits = [
  { id: 'verified', title: 'Verified Professionals', description: 'Skilled and background-checked experts.' },
  { id: 'materials', title: 'Quality Materials', description: 'Only premium-grade materials used.' },
  { id: 'pricing', title: 'Transparent Pricing', description: 'No hidden costs, clear quotes upfront.' },
  { id: 'ontime', title: 'On-time Delivery', description: 'Projects completed on schedule.' },
  { id: 'satisfaction', title: 'Satisfaction Guaranteed', description: 'Your satisfaction is our priority.' },
];

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

interface PageService {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  unit: string;
  startingPrice: string;
  included: string[];
  notes: string[];
  pricing?: {
    enabled: boolean;
    mode: string;
    rate?: number;
    unit?: string;
    quantityLabel?: string;
    defaultQuantity?: number;
    minQuantity?: number;
    maxQuantity?: number;
    step?: number;
  };
  siteVisitCharge: number;
  siteVisitWaiver: {
    enabled: boolean;
    label: string;
    amount: number;
    trigger: string;
  };
}

function adaptService(s: ApiService): PageService {
  return {
    id: s._id,
    name: s.name,
    category: s.category,
    description: s.description,
    imageUrl: s.image?.url,
    unit: s.unit,
    startingPrice: s.startingPrice,
    included: s.included ?? [],
    notes: s.notes ?? [],
    pricing: s.pricing,
    siteVisitCharge: s.siteVisitCharge ?? 300,
    siteVisitWaiver: s.siteVisitWaiver ?? {
      enabled: true,
      label: 'Work Completion Waiver',
      amount: s.siteVisitCharge ?? 300,
      trigger: 'work_completion',
    },
  };
}

function adaptCategory(c: ApiCategory): { id: string; name: string } {
  return { id: c._id, name: c.name };
}

export default function ProFixServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<PageService | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchProFixServices({ active: true }),
      fetchProFixCategories({ active: true }),
    ])
      .then(([svcData, catData]) => {
        const found = svcData.find((s) => s._id === serviceId);
        if (found) setService(adaptService(found));
        setCategories(catData.map(adaptCategory));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleCreateEstimate = useCallback(() => {
    if (!service) return;
    navigate(`/pro-fix/${service.id}/estimate`);
  }, [navigate, service]);

  if (!loading && !service) {
    return (
      <div className="pfsd-page">
        <div className="section-container">
          <div className="pfsd-not-found">
            <h2>Service Not Found</h2>
            <p>The Pro Fix service you are looking for does not exist.</p>
            <button className="pfsd-back" onClick={() => navigate('/pro-fix')} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Pro Fix
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !service) {
    return null;
  }

  const pricing = service.pricing;
  const pricingEnabled = !!pricing?.enabled && pricing.mode !== 'custom';
  const categoryName = categories.find((c) => c.id === service.category)?.name ?? service.category;
  const included = service.included ?? [];
  const notes = service.notes ?? [];

  return (
    <div className="pfsd-page">
      <div className="section-container">
        <button className="pfsd-back" onClick={() => navigate('/pro-fix')} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Pro Fix
        </button>

        <div className="pfsd-hero">
          {service.imageUrl ? (
            <img src={service.imageUrl} alt={service.name} className="pfsd-hero-img" />
          ) : (
            <div className="pfsd-hero-placeholder">
              <Icon name="building" size={56} className="pfsd-hero-placeholder-icon" />
            </div>
          )}
        </div>

        <div className="pfsd-layout">
          <header className="pfsd-head">
            <span className="pfsd-category-chip">{categoryName}</span>
            <h1 className="pfsd-title">{service.name}</h1>
            <p className="pfsd-desc">{service.description}</p>
            <dl className="pfsd-meta">
              <div className="pfsd-meta-item">
                <dt>Category</dt>
                <dd>{categoryName}</dd>
              </div>
              <div className="pfsd-meta-item">
                <dt>Billing Unit</dt>
                <dd>{service.unit}</dd>
              </div>
              <div className="pfsd-meta-item">
                <dt>Pricing</dt>
                <dd>{pricingEnabled ? `Rate-based / ${pricing?.unit ?? service.unit}` : 'Custom Estimate'}</dd>
              </div>
            </dl>
          </header>

          <aside className="pfsd-booking">
            <div className="pfsd-booking-card">
              <span className="pfsd-booking-label">Pricing</span>
              {pricingEnabled ? (
                <div className="pfsd-booking-price">
                  <span className="pfsd-booking-amount">{formatINR(pricing?.rate ?? 0)}</span>
                  <span className="pfsd-booking-unit">/ {pricing?.unit ?? service.unit}</span>
                </div>
              ) : (
                <div className="pfsd-booking-price">
                  <span className="pfsd-booking-custom">Custom Estimate</span>
                </div>
              )}
              <p className="pfsd-booking-note">
                {pricingEnabled
                  ? 'Indicative rate. Create an estimate to see your total.'
                  : 'Pricing depends on your requirements. Our team will prepare a detailed estimate.'}
              </p>
              <button className="pfsd-cta" onClick={handleCreateEstimate} type="button">
                Create Estimate
                <Icon name="arrow-right" size={16} />
              </button>
              <div className="pfsd-booking-support">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pfsd-chat-btn"
                  aria-label="Chat with us on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat with us
                </a>
                <span className="pfsd-booking-reassure">Free estimate &middot; No obligation</span>
              </div>
            </div>
          </aside>

          {included.length > 0 && (
            <section className="pfsd-included" aria-labelledby="pfsd-included-title">
              <h2 className="pfsd-section-title" id="pfsd-included-title">What&apos;s Included</h2>
              <ul className="pfsd-included-list">
                {included.map((item) => (
                  <li key={item} className="pfsd-included-item">
                    <span className="pfsd-included-check">
                      <Icon name="check-circle" size={16} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              {notes.length > 0 && (
                <div className="pfsd-notes">
                  {notes.map((note) => (
                    <p key={note} className="pfsd-note">{note}</p>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="pfsd-trust" aria-label="Why Pro Fix">
            <h2 className="pfsd-section-title">Why Pro Fix</h2>
            <div className="pfsd-trust-grid">
              {TRUST_ITEMS.map((t) => {
                const benefit = proFixBenefits.find((b) => b.id === t.id);
                if (!benefit) return null;
                return (
                  <div key={t.id} className="pfsd-trust-item">
                    <span className="pfsd-trust-icon">
                      <Icon name={t.icon} size={16} />
                    </span>
                    <div className="pfsd-trust-text">
                      <span className="pfsd-trust-name">{benefit.title}</span>
                      <span className="pfsd-trust-desc">{benefit.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

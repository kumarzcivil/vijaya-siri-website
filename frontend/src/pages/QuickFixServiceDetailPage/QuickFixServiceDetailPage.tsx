import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { fetchQuickFixServices, fetchQuickFixCategories } from '../../api/quickFix';
import './QuickFixServiceDetailPage.css';

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatQuickFixDuration(d: { value: number; unit: string } | undefined): string | null {
  if (!d) return null;
  return `~${d.value} ${d.unit}`;
}

const WHATSAPP = 'https://wa.me/919008855088';

interface Service {
  id: string;
  categoryId: string;
  name: string;
  image?: string;
  shortDescription: string;
  description: string;
  includedItems: string[];
  notes: string[];
  pricing: { enabled: boolean; price?: number; priceNote?: string };
  duration?: { value: number; unit: string };
  bookingConfiguration: { requiresTimeSlot: boolean; requiresPayment: boolean };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  displayOrder: number;
}

export default function QuickFixServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchQuickFixServices(),
      fetchQuickFixCategories({ active: true }),
    ])
      .then(([svcData, catData]) => {
        const catMap = new Map(catData.map((c) => [c._id, { id: c._id, name: c.name, icon: c.icon, active: c.active, displayOrder: c.displayOrder }]));
        setCategories(Array.from(catMap.values()));
        const found = svcData.find((s) => s._id === serviceId && s.active);
        if (found) {
          setService({
            id: found._id,
            categoryId: found.categoryId,
            name: found.name,
            image: found.image?.url,
            shortDescription: found.shortDescription,
            description: found.description,
            includedItems: found.includedItems ?? [],
            notes: found.notes ?? [],
            pricing: found.pricing ?? { enabled: false },
            duration: found.duration,
            bookingConfiguration: found.bookingConfiguration,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleBookNow = () => {
    if (!service) return;
    navigate(`/quick-fix/${service.id}/book`);
  };

  if (loading) {
    return (
      <div className="qfd-page">
        <div className="section-container">
          <div className="qfd-not-found">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="qfd-page">
        <div className="section-container">
          <div className="qfd-not-found">
            <h2>Service Not Found</h2>
            <p>The Quick Fix service you are looking for does not exist.</p>
            <button className="qfd-back" onClick={() => navigate('/quick-fix')} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Quick Fix
            </button>
          </div>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === service.categoryId);
  const categoryName = category?.name ?? service.categoryId;
  const includedItems = service.includedItems ?? [];
  const notes = service.notes ?? [];
  const price = service.pricing.enabled ? formatINR(service.pricing.price ?? 0) : null;
  const duration = formatQuickFixDuration(service.duration);

  return (
    <div className="qfd-page">
      <div className="section-container">
        <button className="qfd-back" onClick={() => navigate('/quick-fix')} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quick Fix
        </button>

        <div className="qfd-hero">
          {service.image ? (
            <img src={service.image} alt={service.name} className="qfd-hero-img" />
          ) : (
            <div className="qfd-hero-placeholder">
              <Icon name={category?.icon ?? 'wrench'} size={56} className="qfd-hero-placeholder-icon" />
            </div>
          )}
        </div>

        <div className="qfd-layout">
          <header className="qfd-head">
            <span className="qfd-category-chip">{categoryName}</span>
            <h1 className="qfd-title">{service.name}</h1>
            <p className="qfd-desc">{service.description}</p>
            {(duration || price) && (
              <dl className="qfd-meta">
                {price && (
                  <div className="qfd-meta-item">
                    <dt>Price</dt>
                    <dd>{price}</dd>
                  </div>
                )}
                {duration && (
                  <div className="qfd-meta-item">
                    <dt>Duration</dt>
                    <dd>{duration}</dd>
                  </div>
                )}
                <div className="qfd-meta-item">
                  <dt>Category</dt>
                  <dd>{categoryName}</dd>
                </div>
              </dl>
            )}
          </header>

          <aside className="qfd-booking">
            <div className="qfd-booking-card">
              <span className="qfd-booking-label">Service</span>
              {price ? (
                <div className="qfd-booking-price">
                  <span className="qfd-booking-amount">{price}</span>
                  {duration && <span className="qfd-booking-unit">{duration}</span>}
                </div>
              ) : (
                <div className="qfd-booking-price">
                  <span className="qfd-booking-custom">Price on request</span>
                </div>
              )}
              {service.pricing.priceNote && (
                <p className="qfd-booking-note">{service.pricing.priceNote}</p>
              )}
              <button className="qfd-cta" onClick={handleBookNow} type="button">
                Book Now
                <Icon name="arrow-right" size={16} />
              </button>
              <div className="qfd-booking-support">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qfd-chat-btn"
                  aria-label="Chat with us on WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat with us
                </a>
                <span className="qfd-booking-reassure">Verified professional</span>
              </div>
            </div>
          </aside>

          {includedItems.length > 0 && (
            <section className="qfd-included" aria-labelledby="qfd-included-title">
              <h2 className="qfd-section-title" id="qfd-included-title">What&apos;s Included</h2>
              <ul className="qfd-included-list">
                {includedItems.map((item) => (
                  <li key={item} className="qfd-included-item">
                    <span className="qfd-included-check">
                      <Icon name="check-circle" size={16} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              {notes.length > 0 && (
                <div className="qfd-notes">
                  {notes.map((note) => (
                    <p key={note} className="qfd-note">{note}</p>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

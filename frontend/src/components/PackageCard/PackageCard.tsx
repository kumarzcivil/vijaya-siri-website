import { useNavigate } from 'react-router-dom';
import type { Package } from '../../data';
import Icon from '../Icon/Icon';
import './PackageCard.css';

interface PackageCardProps {
  pkg: Package;
  selected: boolean;
  onSelect: (id: string) => void;
}

function formatPrice(pkg: Package): string {
  if (pkg.price === null) return 'Get Quote';
  return `${pkg.pricePrefix}${pkg.price.toLocaleString('en-IN')}`;
}

export default function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
  const navigate = useNavigate();

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pkg.custom) {
      window.location.href = 'tel:+919008855088';
    } else {
      navigate(`/projects/compare-packages?highlight=${pkg.id}`);
    }
  };

  return (
    <button
      className={`package-card ${selected ? 'package-card--selected' : ''} ${pkg.popular ? 'package-card--popular' : ''} ${pkg.custom ? 'package-card--custom' : ''}`}
      onClick={() => onSelect(pkg.id)}
      aria-pressed={selected}
    >
      {pkg.popular && (
        <div className="package-popular-badge">Most Popular</div>
      )}
      <div className="package-image-area">
        <div className="package-image-placeholder">
          <div className="package-image-icon-wrap">
            <Icon name={pkg.icon} size={36} className="package-image-svg-icon" />
          </div>
        </div>
      </div>
      <div className="package-body">
        <h3 className="package-name">{pkg.name}</h3>
        <p className="package-description">{pkg.description}</p>
        <div className="package-pricing">
          <span className="package-price">{formatPrice(pkg)}</span>
          {pkg.priceUnit && <span className="package-unit">{pkg.priceUnit}</span>}
        </div>
        <span className="package-features-label">Highlights</span>
        <ul className="package-features">
          {(pkg.features || []).map((feature, i) => (
            <li key={i} className="package-feature">
              <svg className="package-feature-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <button
          className="package-cta"
          onClick={handleCtaClick}
          type="button"
        >
          {pkg.custom ? 'Get Custom Quote' : 'Learn More'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </button>
  );
}

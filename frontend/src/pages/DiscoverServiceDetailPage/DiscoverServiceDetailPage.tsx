import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import './DiscoverServiceDetailPage.css';

interface ServiceState {
  title: string;
  description: string;
  icon: string;
  ctaLabel: string;
}

export default function DiscoverServiceDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ServiceState | null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!state?.title) {
    return (
      <div className="dsd-page">
        <div className="section-container">
          <div className="dsd-empty">
            <p>No service information available.</p>
            <Link to="/" className="dsd-back-link">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dsd-page">
      <div className="section-container">
        <div className="dsd-content">
          <button className="dsd-back" onClick={() => navigate(-1)} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>

          <div className="dsd-hero">
            <div className="dsd-icon-wrap">
              <Icon name={state.icon || 'building'} size={28} />
            </div>
            <h1 className="dsd-title">{state.title}</h1>
          </div>

          <div className="dsd-body">
            <div className="dsd-description">
              {state.description.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {state.ctaLabel && (
            <div className="dsd-actions">
              <Link to="/" className="dsd-cta-btn">{state.ctaLabel}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

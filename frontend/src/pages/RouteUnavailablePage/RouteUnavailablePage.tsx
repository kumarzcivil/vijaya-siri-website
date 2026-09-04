import { Link } from 'react-router-dom';
import './RouteUnavailablePage.css';

export default function RouteUnavailablePage() {
  return (
    <div className="route-unavailable-page">
      <div className="section-container">
        <div className="route-unavailable-card">
          <span className="route-unavailable-icon" aria-hidden="true">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <h1 className="route-unavailable-title">Temporarily Unavailable</h1>
          <p className="route-unavailable-text">
            The page you&apos;re looking for is temporarily unavailable.
            Please check back soon.
          </p>
          <Link to="/" className="route-unavailable-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

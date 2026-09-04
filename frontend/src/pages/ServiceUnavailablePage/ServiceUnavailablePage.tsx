import { Link } from 'react-router-dom';
import './ServiceUnavailablePage.css';

interface ServiceUnavailablePageProps {
  service: string;
  location: string;
}

export default function ServiceUnavailablePage({
  service,
  location,
}: ServiceUnavailablePageProps) {
  return (
    <div className="service-unavailable-page">
      <div className="section-container">
        <div className="service-unavailable-card">
          <span className="service-unavailable-icon" aria-hidden="true">
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
          <h1 className="service-unavailable-title">{service} Not Available</h1>
          <p className="service-unavailable-text">
            {service} is not currently available in {location}. Please check back
            soon or select a different location.
          </p>
          <Link to="/" className="service-unavailable-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

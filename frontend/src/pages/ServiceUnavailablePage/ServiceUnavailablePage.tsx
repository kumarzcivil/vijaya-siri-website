import { Link } from 'react-router-dom';
import { locations, type Location } from '../../data/locations';
import { useLocation as useCustomerLocation } from '../../context/LocationContext';
import './ServiceUnavailablePage.css';

interface ServiceUnavailablePageProps {
  service: string;
  location: string;
  locationId?: string;
}

export default function ServiceUnavailablePage({
  service,
  location,
  locationId,
}: ServiceUnavailablePageProps) {
  const { select } = useCustomerLocation();

  const otherLocations = locations.filter((loc) => loc.id !== locationId);

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
            {service} is not currently available in <strong>{location}</strong>.
            {otherLocations.length > 0
              ? ' Try selecting a different location from the header, or check back later.'
              : ' Please check back later.'}
          </p>
          {otherLocations.length > 0 && (
            <div className="service-unavailable-locations">
              <span className="service-unavailable-locations-label">Available in:</span>
              <div className="service-unavailable-location-buttons">
                {otherLocations.map((loc: Location) => (
                  <button
                    key={loc.id}
                    className="service-unavailable-location-btn"
                    onClick={() => select(loc.id)}
                  >
                    {loc.city}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Link to="/" className="service-unavailable-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

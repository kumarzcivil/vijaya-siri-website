import { Link } from 'react-router-dom';
import type { SiteFeature } from '../../data/siteControl';
import './RouteUnavailablePage.css';

const FEATURE_MESSAGES: Record<SiteFeature, { title: string; text: string }> = {
  home: {
    title: 'Website Under Maintenance',
    text: 'Our website is currently undergoing maintenance. Please check back shortly.',
  },
  projects: {
    title: 'Projects Currently Unavailable',
    text: 'Our project gallery is temporarily unavailable. Please check back soon to explore our work.',
  },
  packages: {
    title: 'Packages Currently Unavailable',
    text: 'Our service packages are temporarily unavailable. Please check back soon to view our offerings.',
  },
  proFix: {
    title: 'Pro Fix Temporarily Unavailable',
    text: 'Our Pro Fix service is currently unavailable in your area. Please check back later or try Quick Fix.',
  },
  quickFix: {
    title: 'Quick Fix Temporarily Unavailable',
    text: 'Our Quick Fix service is currently unavailable in your area. Please check back later or try Pro Fix.',
  },
  about: {
    title: 'About Page Unavailable',
    text: 'Our about page is temporarily unavailable. Please check back soon to learn more about us.',
  },
  quote: {
    title: 'Quote Form Unavailable',
    text: 'Our quote request form is temporarily unavailable. Please check back soon or contact us directly.',
  },
  account: {
    title: 'Account Page Unavailable',
    text: 'The account page is temporarily unavailable. Please check back soon.',
  },
  offers: {
    title: 'Offers Currently Unavailable',
    text: 'Our offers page is temporarily unavailable. Please check back soon for the latest deals.',
  },
};

const MAINTENANCE_MESSAGE = {
  title: 'Website Under Maintenance',
  text: 'We are currently performing scheduled maintenance. Please check back soon.',
};

interface RouteUnavailablePageProps {
  feature?: SiteFeature | null;
  isMaintenance?: boolean;
}

export default function RouteUnavailablePage({ feature, isMaintenance }: RouteUnavailablePageProps) {
  const msg = isMaintenance
    ? MAINTENANCE_MESSAGE
    : feature && FEATURE_MESSAGES[feature]
      ? FEATURE_MESSAGES[feature]
      : { title: 'Temporarily Unavailable', text: 'The page you\'re looking for is temporarily unavailable. Please check back soon.' };

  return (
    <div className="route-unavailable-page">
      <div className="section-container">
        <div className="route-unavailable-card">
          <span className="route-unavailable-icon" aria-hidden="true">
            {isMaintenance ? (
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
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            ) : (
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
            )}
          </span>
          <h1 className="route-unavailable-title">{msg.title}</h1>
          <p className="route-unavailable-text">{msg.text}</p>
          <Link to="/" className="route-unavailable-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

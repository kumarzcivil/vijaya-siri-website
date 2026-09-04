import './NotificationsPage.css';

const CATEGORIES = [
  { id: 'booking', label: 'Booking Updates' },
  { id: 'quote', label: 'Quote Updates' },
  { id: 'service', label: 'Service Updates' },
  { id: 'account', label: 'Account Updates' },
];

export default function NotificationsPage() {
  return (
    <div className="notifications-page">
      <div className="section-container">
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">
            Stay updated about your service requests, bookings, and account.
          </p>
        </div>

        <div className="notifications-categories" aria-hidden="true">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="notifications-category">
              <span className="notifications-category-dot" />
              {cat.label}
            </div>
          ))}
        </div>

        <div className="notifications-empty">
          <span className="notifications-empty-icon" aria-hidden="true">
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>
          <h2 className="notifications-empty-title">You&apos;re all caught up</h2>
          <p className="notifications-empty-text">
            New updates about your bookings, quotes, and services will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

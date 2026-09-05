import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { fetchMyBookings, type Booking } from '../../api/bookings';
import './BookingsPage.css';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

type TabId = 'upcoming' | 'completed' | 'cancelled';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const EMPTY_MESSAGES: Record<TabId, { title: string; text: string }> = {
  upcoming: {
    title: 'No upcoming bookings',
    text: 'Your scheduled service requests will appear here once you book a service.',
  },
  completed: {
    title: 'No completed bookings',
    text: 'Completed service requests will appear here.',
  },
  cancelled: {
    title: 'No cancelled bookings',
    text: 'Cancelled service requests will appear here.',
  },
};

function formatSchedule(date?: string, time?: string): string {
  const parts: string[] = [];
  if (date) {
    const parsed = new Date(`${date}T00:00:00`);
    parts.push(Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
  }
  if (time) parts.push(time);
  return parts.join(' \u00B7 ');
}

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

function statusLabel(status: BookingStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function detailsPath(b: Booking): string {
  if (b.kind === 'quick-fix') return `/quick-fix/${b.serviceId}/confirmed`;
  return `/pro-fix/${b.serviceId}/estimate/confirmed`;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('upcoming');

  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = bookings.filter((b) => b.status === activeTab);

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="section-container">
          <div className="bookings-header">
            <h1 className="bookings-title">My Bookings</h1>
          </div>
          <div className="bookings-loading">Loading bookings...</div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bookings-page">
        <div className="section-container">
          <div className="bookings-header">
            <h1 className="bookings-title">My Bookings</h1>
            <p className="bookings-subtitle">
              View and manage your service requests and bookings.
            </p>
          </div>

          <div className="bookings-empty">
            <span className="bookings-empty-icon" aria-hidden="true">
              <Icon name="receipt" size={30} />
            </span>
            <h2 className="bookings-empty-title">No bookings yet</h2>
            <p className="bookings-empty-text">
              Your service bookings will appear here once you book a service.
            </p>
            <Link to="/quote" className="bookings-cta-btn">
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="section-container">
        <div className="bookings-header">
          <h1 className="bookings-title">My Bookings</h1>
          <p className="bookings-subtitle">
            View and manage your service requests and bookings.
          </p>
        </div>

        <div className="bookings-tabs" role="tablist" aria-label="Booking status">
          {TABS.map((tab) => {
            const count = bookings.filter((b) => b.status === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`bookings-tab ${activeTab === tab.id ? 'bookings-tab--active' : ''}`}
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {count > 0 && <span className="bookings-tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {visible.length > 0 ? (
          <div className="bookings-list">
            {visible.map((booking) => (
              <article key={booking._id} className="bookings-card">
                <div className="bookings-card-top">
                  <div className="bookings-card-kind">
                    {booking.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix'}
                  </div>
                  <span className={`bookings-status bookings-status--${booking.status}`}>
                    {statusLabel(booking.status)}
                  </span>
                </div>

                <h3 className="bookings-card-title">{booking.serviceName}</h3>
                <p className="bookings-card-category">{booking.categoryName}</p>

                <dl className="bookings-card-rows">
                  {(booking.paymentStatus === 'paid' || booking.paymentStatus === 'submitted') && booking.paymentRef && (
                    <div className="bookings-row">
                      <dt>Reference</dt>
                      <dd>{booking.paymentRef}</dd>
                    </div>
                  )}
                  {(booking.siteAddress || booking.siteLocation) && (
                    <div className="bookings-row">
                      <dt>Location</dt>
                      <dd>{[booking.siteAddress, booking.siteLocation].filter(Boolean).join(', ')}</dd>
                    </div>
                  )}
                  {booking.slotDate && (
                    <div className="bookings-row">
                      <dt>Scheduled</dt>
                      <dd>{formatSchedule(booking.slotDate, booking.slotTime || undefined)}</dd>
                    </div>
                  )}
                  {booking.amount > 0 && (
                    <div className="bookings-row">
                      <dt>Amount</dt>
                      <dd>{formatINR(booking.amount)}</dd>
                    </div>
                  )}
                </dl>

                <Link to={detailsPath(booking)} className="bookings-details-btn">
                  View Details
                  <Icon name="arrow-right" size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="bookings-empty bookings-empty--compact">
            <span className="bookings-empty-icon" aria-hidden="true">
              <Icon name="receipt" size={30} />
            </span>
            <h2 className="bookings-empty-title">{EMPTY_MESSAGES[activeTab].title}</h2>
            <p className="bookings-empty-text">{EMPTY_MESSAGES[activeTab].text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

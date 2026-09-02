import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { formatINR as formatINRQuickFix } from '../../data/quickfix';
import { formatINR as formatINRProFix } from '../../data/profix';
import { useQuickFixBooking } from '../../hooks/useQuickFixBooking';
import { useProFixBooking } from '../../hooks/useProFixBooking';
import './BookingsPage.css';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

interface BookingCardData {
  id: string;
  kind: 'quick-fix' | 'pro-fix';
  serviceName: string;
  categoryName: string;
  location: string;
  scheduledDate?: string;
  scheduledTime?: string;
  amount?: number;
  status: BookingStatus;
  paymentRef?: string;
  detailsPath: string;
}

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

function statusLabel(status: BookingStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function BookingsPage() {
  const quickFixBooking = useQuickFixBooking();
  const proFixOrder = useProFixBooking();
  const [activeTab, setActiveTab] = useState<TabId>('upcoming');

  const bookings = useMemo<BookingCardData[]>(() => {
    const result: BookingCardData[] = [];

    if (quickFixBooking) {
      const location = [quickFixBooking.customerDetails.siteAddress, quickFixBooking.customerDetails.siteLocation]
        .filter(Boolean)
        .join(', ');
      result.push({
        id: `quick-fix-${quickFixBooking.serviceId}`,
        kind: 'quick-fix',
        serviceName: quickFixBooking.serviceName,
        categoryName: quickFixBooking.categoryName,
        location,
        scheduledDate: quickFixBooking.slotDate || undefined,
        scheduledTime: quickFixBooking.slotTime || undefined,
        amount: quickFixBooking.paymentRequired ? quickFixBooking.payableNow : quickFixBooking.amount,
        status: 'upcoming',
        paymentRef:
          quickFixBooking.paymentStatus === 'paid' && quickFixBooking.paymentRef
            ? quickFixBooking.paymentRef
            : undefined,
        detailsPath: `/quick-fix/${quickFixBooking.serviceId}/confirmed`,
      });
    }

    if (proFixOrder) {
      const location = [proFixOrder.billingDetails.siteAddress, proFixOrder.billingDetails.siteLocation]
        .filter(Boolean)
        .join(', ');
      result.push({
        id: `pro-fix-${proFixOrder.serviceId}`,
        kind: 'pro-fix',
        serviceName: proFixOrder.serviceName,
        categoryName: proFixOrder.categoryName,
        location,
        amount: proFixOrder.effectiveSiteVisitCost > 0 ? proFixOrder.effectiveSiteVisitCost : proFixOrder.siteVisitCharge,
        status: 'upcoming',
        paymentRef:
          proFixOrder.paymentStatus === 'paid' && proFixOrder.paymentRef
            ? proFixOrder.paymentRef
            : undefined,
        detailsPath: `/pro-fix/${proFixOrder.serviceId}/estimate/confirmed`,
      });
    }

    return result;
  }, [quickFixBooking, proFixOrder]);

  const visibleBookings = bookings.filter((b) => b.status === activeTab);
  const formatINR = (value: number, kind: 'quick-fix' | 'pro-fix') =>
    kind === 'quick-fix' ? formatINRQuickFix(value) : formatINRProFix(value);

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
            <Link to="/quick-fix" className="bookings-cta-btn">
              Explore Services
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

        {visibleBookings.length > 0 ? (
          <div className="bookings-list">
            {visibleBookings.map((booking) => (
              <article key={booking.id} className="bookings-card">
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
                  {booking.paymentRef && (
                    <div className="bookings-row">
                      <dt>Reference</dt>
                      <dd>{booking.paymentRef}</dd>
                    </div>
                  )}
                  {booking.location && (
                    <div className="bookings-row">
                      <dt>Location</dt>
                      <dd>{booking.location}</dd>
                    </div>
                  )}
                  {booking.scheduledDate && (
                    <div className="bookings-row">
                      <dt>Scheduled</dt>
                      <dd>{formatSchedule(booking.scheduledDate, booking.scheduledTime)}</dd>
                    </div>
                  )}
                  {booking.amount !== undefined && (
                    <div className="bookings-row">
                      <dt>Amount</dt>
                      <dd>{formatINR(booking.amount, booking.kind)}</dd>
                    </div>
                  )}
                </dl>

                <Link to={booking.detailsPath} className="bookings-details-btn">
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

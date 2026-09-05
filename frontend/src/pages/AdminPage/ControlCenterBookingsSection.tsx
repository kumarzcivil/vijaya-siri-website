import { useEffect, useState } from 'react';
import { fetchAdminBookings, fetchBookingStats, updateBookingStatus, type Booking, type BookingStats } from '../../api/bookings';

export default function ControlCenterBookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([fetchAdminBookings(), fetchBookingStats()])
      .then(([b, s]) => { setBookings(b); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      setStats((prev) => {
        const counts = { ...prev };
        counts[status as keyof BookingStats] = (counts[status as keyof BookingStats] as number) + 1;
        return counts;
      });
    } catch {}
  };

  if (loading) {
    return (
      <div className="cc-page">
        <header className="admin-dash-header">
          <span className="admin-dash-eyebrow">Control Center</span>
          <h1 className="admin-dash-title">Bookings</h1>
        </header>
        <div className="cc-loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Bookings</h1>
        <p className="admin-dash-subtitle">
          View and manage all confirmed service bookings and site visits.
        </p>
      </header>

      {bookings.length === 0 ? (
        <div className="cc-empty-state">
          <h2 className="cc-empty-title">No bookings yet</h2>
          <p className="cc-empty-text">
            Confirmed Quick Fix and Pro Fix bookings will appear here once customers book services.
          </p>
        </div>
      ) : (
        <>
          <div className="cc-summary-strip">
            <div className="cc-summary-stat">
              <span className="cc-summary-stat-value">{stats.total}</span>
              <span className="cc-summary-stat-label">Total</span>
            </div>
            <div className="cc-summary-stat">
              <span className="cc-summary-stat-value">{stats.upcoming}</span>
              <span className="cc-summary-stat-label">Upcoming</span>
            </div>
            <div className="cc-summary-stat">
              <span className="cc-summary-stat-value">{stats.completed}</span>
              <span className="cc-summary-stat-label">Completed</span>
            </div>
            <div className="cc-summary-stat">
              <span className="cc-summary-stat-value">{stats.cancelled}</span>
              <span className="cc-summary-stat-label">Cancelled</span>
            </div>
          </div>

          <div className="cc-list cc-list--bookings">
            {bookings.map((booking) => (
              <article key={booking._id} className="cc-card cc-card--booking">
                <div className="cc-card-body">
                  <div className="cc-card-topline">
                    <span className={`cc-kind cc-kind--${booking.kind}`}>
                      {booking.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix'}
                    </span>
                    {booking.customerName && <span className="cc-ref">{booking.customerName}</span>}
                  </div>
                  <h3 className="cc-card-title">{booking.serviceName}</h3>
                  <p className="cc-card-meta">{booking.categoryName}</p>
                  <dl className="cc-rows">
                    <div className="cc-row">
                      <dt>Customer</dt>
                      <dd>{booking.customerName} · {booking.customerMobile}</dd>
                    </div>
                    {(booking.siteAddress || booking.siteLocation) && (
                      <div className="cc-row">
                        <dt>Location</dt>
                        <dd>{[booking.siteAddress, booking.siteLocation].filter(Boolean).join(', ')}</dd>
                      </div>
                    )}
                    {booking.slotDate && (
                      <div className="cc-row">
                        <dt>Scheduled</dt>
                        <dd>
                          {formatDate(booking.slotDate)}
                          {booking.slotTime ? ` · ${booking.slotTime}` : ''}
                        </dd>
                      </div>
                    )}
                    {booking.amount > 0 && (
                      <div className="cc-row">
                        <dt>Amount</dt>
                        <dd>{formatINR(booking.amount)}</dd>
                      </div>
                    )}
                    {booking.paymentRef && (
                      <div className="cc-row">
                        <dt>Payment</dt>
                        <dd>{booking.paymentStatus} · {booking.paymentRef}</dd>
                      </div>
                    )}
                    {booking.couponCode && (
                      <div className="cc-row">
                        <dt>Coupon</dt>
                        <dd>{booking.couponCode} (−{formatINR(booking.couponDiscount)})</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="cc-card-actions cc-card-actions--status">
                  <span className="cc-status-label">Status</span>
                  <div className="cc-status-btns">
                    {(['upcoming', 'completed', 'cancelled'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`cc-status-btn${booking.status === s ? ` cc-status-btn--active cc-status-btn--${s}` : ''}`}
                        onClick={() => handleStatus(booking._id, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

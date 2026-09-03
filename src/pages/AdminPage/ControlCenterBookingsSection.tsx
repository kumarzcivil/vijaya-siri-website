import { useBookingsRegistry } from '../../hooks/useBookingsRegistry';
import { updateBookingStatus, type BookingRegistryStatus } from '../../data/bookingsRegistry';
import { formatINR as formatINRProFix } from '../../data/profix';
import { formatINR as formatINRQuickFix } from '../../data/quickfix';

const STATUS_OPTIONS: BookingRegistryStatus[] = ['upcoming', 'completed', 'cancelled'];

function formatINR(amount: number, kind: 'quick-fix' | 'pro-fix'): string {
  return kind === 'quick-fix' ? formatINRQuickFix(amount) : formatINRProFix(amount);
}

export default function ControlCenterBookingsSection() {
  const bookings = useBookingsRegistry();

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
        <div className="cc-summary-strip">
          <div className="cc-summary-stat">
            <span className="cc-summary-stat-value">{bookings.length}</span>
            <span className="cc-summary-stat-label">Total</span>
          </div>
          <div className="cc-summary-stat">
            <span className="cc-summary-stat-value">
              {bookings.filter((b) => b.status === 'upcoming').length}
            </span>
            <span className="cc-summary-stat-label">Upcoming</span>
          </div>
          <div className="cc-summary-stat">
            <span className="cc-summary-stat-value">
              {bookings.filter((b) => b.status === 'completed').length}
            </span>
            <span className="cc-summary-stat-label">Completed</span>
          </div>
          <div className="cc-summary-stat">
            <span className="cc-summary-stat-value">
              {bookings.filter((b) => b.status === 'cancelled').length}
            </span>
            <span className="cc-summary-stat-label">Cancelled</span>
          </div>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="cc-list cc-list--bookings">
          {bookings.map((booking) => (
            <article key={booking.id} className="cc-card cc-card--booking">
              <div className="cc-card-body">
                <div className="cc-card-topline">
                  <span className={`cc-kind cc-kind--${booking.kind}`}>
                    {booking.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix'}
                  </span>
                  {booking.bookingId && <span className="cc-ref">{booking.bookingId}</span>}
                </div>
                <h3 className="cc-card-title">{booking.serviceName}</h3>
                <p className="cc-card-meta">{booking.categoryName}</p>
                <dl className="cc-rows">
                  <div className="cc-row">
                    <dt>Customer</dt>
                    <dd>{booking.customerName} · {booking.customerMobile}</dd>
                  </div>
                  {booking.location && (
                    <div className="cc-row">
                      <dt>Location</dt>
                      <dd>{booking.location}</dd>
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
                  <div className="cc-row">
                    <dt>Amount</dt>
                    <dd>{formatINR(booking.amount, booking.kind)}</dd>
                  </div>
                  {booking.paymentRef && (
                    <div className="cc-row">
                      <dt>Payment</dt>
                      <dd>{booking.paymentStatus} · {booking.paymentRef}</dd>
                    </div>
                  )}
                  {booking.couponCode && (
                    <div className="cc-row">
                      <dt>Coupon</dt>
                      <dd>{booking.couponCode} (−{formatINR(booking.couponDiscount ?? 0, booking.kind)})</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="cc-card-actions cc-card-actions--status">
                <span className="cc-status-label">Status</span>
                <div className="cc-status-btns">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`cc-status-btn${booking.status === s ? ` cc-status-btn--active cc-status-btn--${s}` : ''}`}
                      onClick={() => updateBookingStatus(booking.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

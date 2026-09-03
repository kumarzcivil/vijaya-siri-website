import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { formatINR } from '../../data/quickfix';
import { recordQuickFixBooking } from '../../data/bookingsRegistry';
import { addNotification } from '../../store/notifications';
import { useQuickFixBooking } from '../../hooks/useQuickFixBooking';
import './QuickFixConfirmationPage.css';

export default function QuickFixConfirmationPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const booking = useQuickFixBooking();
  const recorded = useRef(false);

  useEffect(() => {
    if (booking && !recorded.current) {
      recorded.current = true;
      recordQuickFixBooking(booking);
      addNotification({
        title: 'Quick Fix booking confirmed',
        message: `Your ${booking.serviceName} booking${booking.bookingId ? ` (${booking.bookingId})` : ''} is confirmed.`,
        category: 'booking',
        customerId: booking.customerId,
      });
    }
  }, [booking]);

  const scheduleLabel = useMemo(() => {
    if (!booking?.slotDate) return '';
    const date = new Date(`${booking.slotDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return booking.slotDate;
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }, [booking]);

  const handleBackToQuickFix = useCallback(() => {
    navigate('/quick-fix');
  }, [navigate]);

  const handleViewBookings = useCallback(() => {
    navigate('/bookings');
  }, [navigate]);

  if (!booking || (serviceId && booking.serviceId !== serviceId)) {
    return (
      <div className="qfc-page">
        <div className="section-container">
          <div className="qfc-not-found">
            <h2>No Booking Found</h2>
            <p>We could not find a recent Quick Fix booking. Please start a new booking.</p>
            <button className="qfc-home-btn" onClick={handleBackToQuickFix} type="button">
              Back to Quick Fix
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qfc-page">
      <div className="section-container">
        <div className="qfc-card">
          <span className="qfc-success-icon">
            <Icon name="check-circle" size={30} />
          </span>
          <span className="qfc-eyebrow">Vijaya Siri Quick Fix</span>
          <h1 className="qfc-title">Booking Confirmed</h1>
          <p className="qfc-subtitle">Your service is scheduled.</p>

          <dl className="qfc-rows">
            {booking.bookingId && (
              <div className="qfc-row">
                <dt>Booking ID</dt>
                <dd>{booking.bookingId}</dd>
              </div>
            )}
            <div className="qfc-row">
              <dt>Service</dt>
              <dd>{booking.serviceName}</dd>
            </div>
            {booking.slotDate && booking.slotTime && (
              <div className="qfc-row">
                <dt>Schedule</dt>
                <dd>{scheduleLabel} &middot; {booking.slotTime}</dd>
              </div>
            )}
            <div className="qfc-row">
              <dt>Site</dt>
              <dd>
                {[booking.customerDetails.siteAddress, booking.customerDetails.siteLocation]
                  .filter(Boolean)
                  .join(', ')}
              </dd>
            </div>
            <div className="qfc-row">
              <dt>{booking.paymentRequired ? 'Paid Now' : 'Amount'}</dt>
              <dd>{formatINR(booking.paymentRequired ? booking.payableNow : booking.amount)}</dd>
            </div>
            {booking.couponCode && (
              <div className="qfc-row">
                <dt>Coupon {booking.couponCode}</dt>
                <dd>&minus;{formatINR(booking.couponDiscount ?? 0)}</dd>
              </div>
            )}
            <div className="qfc-row">
              <dt>Payment Method</dt>
              <dd>{booking.paymentMethod ? paymentMethodLabel(booking.paymentMethod) : '\u2014'}</dd>
            </div>
            <div className="qfc-row">
              <dt>Payment Status</dt>
              <dd className={booking.paymentStatus === 'paid' ? 'qfc-row-paid' : 'qfc-row-later'}>
                {paymentStatusLabel(booking)}
              </dd>
            </div>
          </dl>

          <p className="qfc-note">
            Our professional will reach out on {booking.customerDetails.mobile} before arriving.
          </p>

          <div className="qfc-actions">
            <button className="qfc-home-btn" onClick={handleViewBookings} type="button">
              View My Bookings
            </button>
            <button className="qfc-ghost-btn" onClick={handleBackToQuickFix} type="button">
              Back to Quick Fix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case 'MANUAL_UPI':
      return 'Manual \u00B7 UPI';
    case 'MANUAL_BANK':
      return 'Manual \u00B7 Bank Transfer';
    case 'ONLINE':
      return 'Online';
    case 'CASH':
      return 'Cash Payment';
    default:
      return method;
  }
}

function paymentStatusLabel(booking: {
  paymentStatus: string;
  paymentRef: string;
}): string {
  switch (booking.paymentStatus) {
    case 'paid':
      return `Paid \u00B7 ${booking.paymentRef}`;
    case 'submitted':
      return `Submitted \u00B7 ${booking.paymentRef}`;
    default:
      return 'Pay after service';
  }
}

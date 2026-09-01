import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { formatINR } from '../../data/quickfix';
import { useQuickFixBooking } from '../../hooks/useQuickFixBooking';
import './QuickFixConfirmationPage.css';

export default function QuickFixConfirmationPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const booking = useQuickFixBooking();

  const scheduleLabel = useMemo(() => {
    if (!booking?.slotDate) return '';
    const date = new Date(`${booking.slotDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return booking.slotDate;
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }, [booking]);

  const handleBackToQuickFix = useCallback(() => {
    navigate('/quick-fix');
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
            <div className="qfc-row">
              <dt>Payment Status</dt>
              <dd className={booking.paymentStatus === 'paid' ? 'qfc-row-paid' : 'qfc-row-later'}>
                {booking.paymentStatus === 'paid'
                  ? `Paid \u00B7 ${booking.paymentRef}`
                  : 'Pay after service'}
              </dd>
            </div>
          </dl>

          <p className="qfc-note">
            Our professional will reach out on {booking.customerDetails.mobile} before arriving.
          </p>

          <button className="qfc-home-btn" onClick={handleBackToQuickFix} type="button">
            Back to Quick Fix
          </button>
        </div>
      </div>
    </div>
  );
}

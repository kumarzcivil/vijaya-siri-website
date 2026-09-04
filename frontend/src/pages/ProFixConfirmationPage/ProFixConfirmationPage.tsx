import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { formatINR } from '../../data/profix';
import { recordProFixBooking } from '../../data/bookingsRegistry';
import { addNotification } from '../../store/notifications';
import { useProFixBooking } from '../../hooks/useProFixBooking';
import './ProFixConfirmationPage.css';

export default function ProFixConfirmationPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const order = useProFixBooking();
  const recorded = useRef(false);

  useEffect(() => {
    if (order && !recorded.current) {
      recorded.current = true;
      recordProFixBooking(order);
      addNotification({
        title: 'Pro Fix site visit booked',
        message: `Your ${order.serviceName} site visit${order.bookingId ? ` (${order.bookingId})` : ''} is confirmed.`,
        category: 'booking',
        customerId: order.customerId,
      });
    }
  }, [order]);

  const handleBackToProFix = useCallback(() => {
    navigate('/pro-fix');
  }, [navigate]);

  const handleViewBookings = useCallback(() => {
    navigate('/bookings');
  }, [navigate]);

  if (!order || (serviceId && order.serviceId !== serviceId)) {
    return (
      <div className="pfconf-page">
        <div className="section-container">
          <div className="pfconf-not-found">
            <h2>No Site Visit Found</h2>
            <p>We could not find a recent site visit booking. Please start a new booking.</p>
            <button className="pfconf-home-btn" onClick={handleBackToProFix} type="button">
              Back to Pro Fix
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pfconf-page">
      <div className="section-container">
        <div className="pfconf-card">
          <span className="pfconf-success-icon">
            <Icon name="check-circle" size={30} />
          </span>
          <span className="pfconf-eyebrow">Vijaya Siri Pro Fix</span>
          <h1 className="pfconf-title">Site Visit Booked</h1>
          <p className="pfconf-subtitle">Your site visit is confirmed.</p>

          <dl className="pfconf-rows">
            {order.bookingId && (
              <div className="pfconf-row">
                <dt>Booking ID</dt>
                <dd>{order.bookingId}</dd>
              </div>
            )}
            <div className="pfconf-row">
              <dt>Service</dt>
              <dd>{order.serviceName}</dd>
            </div>
            {order.slotDate && order.slotTime && (
              <div className="pfconf-row">
                <dt>Schedule</dt>
                <dd>{order.slotDate} &middot; {order.slotTime}</dd>
              </div>
            )}
            <div className="pfconf-row">
              <dt>Site</dt>
              <dd>
                {[order.billingDetails.siteAddress, order.billingDetails.siteLocation]
                  .filter(Boolean)
                  .join(', ')}
              </dd>
            </div>
            <div className="pfconf-row">
              <dt>Site Visit Charge</dt>
              <dd>{formatINR(order.payableNow)}</dd>
            </div>
            {order.couponCode && (
              <div className="pfconf-row">
                <dt>Coupon {order.couponCode}</dt>
                <dd>&minus;{formatINR(order.couponDiscount ?? 0)}</dd>
              </div>
            )}
            <div className="pfconf-row">
              <dt>Payment Method</dt>
              <dd>{order.paymentMethod ? paymentMethodLabel(order.paymentMethod) : '\u2014'}</dd>
            </div>
            <div className="pfconf-row">
              <dt>Payment Status</dt>
              <dd className={order.paymentStatus === 'paid' ? 'pfconf-row-paid' : 'pfconf-row-later'}>
                {paymentStatusLabel(order)}
              </dd>
            </div>
          </dl>

          <div className="pfconf-waiver" role="note">
            <Icon name="check-circle" size={16} />
            This charge will be waived after work completion.
          </div>

          <p className="pfconf-note">
            Our team will reach out on {order.billingDetails.mobile} to coordinate the visit.
          </p>

          <div className="pfconf-actions">
            <button className="pfconf-home-btn" onClick={handleViewBookings} type="button">
              View My Bookings
            </button>
            <button className="pfconf-ghost-btn" onClick={handleBackToProFix} type="button">
              Back to Pro Fix
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

function paymentStatusLabel(order: { paymentStatus: string; paymentRef: string }): string {
  switch (order.paymentStatus) {
    case 'paid':
      return `Paid \u00B7 ${order.paymentRef}`;
    case 'submitted':
      return `Submitted \u00B7 ${order.paymentRef}`;
    default:
      return '\u2014';
  }
}

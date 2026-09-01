import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { formatINR } from '../../data/profix';
import { useProFixBooking } from '../../hooks/useProFixBooking';
import './ProFixConfirmationPage.css';

export default function ProFixConfirmationPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const order = useProFixBooking();

  const handleBackToProFix = useCallback(() => {
    navigate('/pro-fix');
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
            <div className="pfconf-row">
              <dt>Service</dt>
              <dd>{order.serviceName}</dd>
            </div>
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
              <dd>{formatINR(order.siteVisitCharge)}</dd>
            </div>
            <div className="pfconf-row">
              <dt>Payment Status</dt>
              <dd className="pfconf-row-paid">Paid &middot; {order.paymentRef}</dd>
            </div>
          </dl>

          <div className="pfconf-waiver" role="note">
            <Icon name="check-circle" size={16} />
            This charge will be waived after work completion.
          </div>

          <p className="pfconf-note">
            Our team will reach out on {order.billingDetails.mobile} to coordinate the visit.
          </p>

          <button className="pfconf-home-btn" onClick={handleBackToProFix} type="button">
            Back to Pro Fix
          </button>
        </div>
      </div>
    </div>
  );
}

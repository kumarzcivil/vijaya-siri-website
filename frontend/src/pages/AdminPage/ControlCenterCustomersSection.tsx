import { useMemo, useState } from 'react';
import { getCustomers, deleteCustomer } from '../../data/customerStore';
import { useBookingsRegistry } from '../../hooks/useBookingsRegistry';

export default function ControlCenterCustomersSection() {
  const [customers, setCustomers] = useState(getCustomers);
  const bookings = useBookingsRegistry();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, query]);

  const handleDelete = (id: string) => {
    setCustomers(deleteCustomer(id));
  };

  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Customers</h1>
        <p className="admin-dash-subtitle">
          View and manage customer profiles and their activity.
        </p>
      </header>

      {customers.length > 0 && (
        <div className="admin-search cc-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="admin-search-input"
            placeholder="Search by name, mobile or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="cc-empty-state">
          <h2 className="cc-empty-title">
            {customers.length === 0 ? 'No customer records yet' : 'No matches found'}
          </h2>
          <p className="cc-empty-text">
            {customers.length === 0
              ? 'Customer profiles will appear here as customers create and use their accounts.'
              : 'Try a different name, mobile number, or email.'}
          </p>
        </div>
      ) : (
        <div className="cc-list">
          {filtered.map((customer) => {
            const customerBookings = bookings.filter(
              (b) => !b.customerId || b.customerId === customer.id
            );
            return (
              <article key={customer.id} className="cc-card cc-card--customer">
                <div className="cc-card-avatar" aria-hidden="true">
                  {customer.fullName ? customer.fullName.trim().charAt(0).toUpperCase() : '?'}
                </div>
                <div className="cc-card-body">
                  <h3 className="cc-card-title">
                    {customer.fullName || 'Unnamed customer'}
                  </h3>
                  <p className="cc-card-meta">
                    {customer.mobile ? `+91 ${customer.mobile}` : 'No mobile'} ·{' '}
                    {customer.email || 'no email'}
                  </p>
                  <p className="cc-card-sub">
                    {customerBookings.length} booking{customerBookings.length === 1 ? '' : 's'}
                    {customer.createdAt
                      ? ` · joined ${new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : ''}
                  </p>
                  <div className="cc-card-tags">
                    <span className="cc-tag">
                      Booking updates: {customer.notificationPrefs.bookings ? 'On' : 'Off'}
                    </span>
                    <span className="cc-tag">
                      Offers: {customer.notificationPrefs.offers ? 'On' : 'Off'}
                    </span>
                    <span className="cc-tag">
                      Marketing: {customer.marketingOptIn ? 'Opted in' : 'Opted out'}
                    </span>
                  </div>
                </div>
                <div className="cc-card-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => {
                      if (window.confirm(`Delete customer ${customer.fullName || 'record'} and their addresses/preferences?`)) {
                        handleDelete(customer.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAdminBookings, fetchBookingStats, updateBookingStatus, assignBookingVendor, deleteBooking, type Booking, type BookingStats } from '../../api/bookings';
import { SkeletonRow } from '../../components/Skeleton/Skeleton';
import { logger } from '../../utils/logger';
import './ControlCenterBookingsSection.css';

export default function ControlCenterBookingsSection() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignName, setAssignName] = useState('');
  const [assignPhone, setAssignPhone] = useState('');
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (toast) {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 2600);
    }
    return () => { if (toastTimer.current !== null) window.clearTimeout(toastTimer.current); };
  }, [toast]);

  const load = useCallback(() => {
    logger.info('Bookings', 'Fetching bookings...');
    Promise.all([
      fetchAdminBookings({ search: searchQuery || undefined }),
      fetchBookingStats(),
    ])
      .then(([b, s]) => {
        setBookings(b);
        setStats(s);
        logger.success('Bookings', `Loaded ${b.length} bookings`);
      })
      .catch((err) => {
        logger.error('Bookings', 'Failed to load bookings', err);
      })
      .finally(() => setLoading(false));
  }, [searchQuery]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      setStats((prev) => {
        const counts = { ...prev };
        counts[status as keyof BookingStats] = (counts[status as keyof BookingStats] as number) + 1;
        return counts;
      });
      logger.success('Bookings', `Booking marked as ${status}`);
    } catch (err: any) {
      logger.error('Bookings', `Failed to update status: ${err.message}`);
    }
  };

  const handleAssign = async (id: string) => {
    if (!assignName.trim()) return;
    try {
      const updated = await assignBookingVendor(id, assignName.trim(), assignPhone.trim());
      setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      setAssigningId(null);
      setAssignName('');
      setAssignPhone('');
      logger.success('Bookings', `Vendor ${assignName} assigned`);
    } catch (err: any) {
      logger.error('Bookings', `Failed to assign vendor: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
      setToast({ message: 'Booking deleted successfully' });
      logger.success('Bookings', 'Booking deleted');
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to delete booking', isError: true });
      logger.error('Bookings', `Failed to delete booking: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="cc-page">
        <header className="admin-dash-header">
          <span className="admin-dash-eyebrow">Control Center</span>
          <h1 className="admin-dash-title">Bookings</h1>
        </header>
        <div className="cc-loading">
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
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

      {/* Search */}
      <div className="admin-search cc-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="admin-search-input"
          placeholder="Search by customer name, mobile or service..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {searchInput && searchInput !== searchQuery && (
          <button type="button" className="btn btn--sm btn-ghost" onClick={handleSearch}>
            Search
          </button>
        )}
        {searchQuery && (
          <button
            type="button"
            className="btn btn--sm btn-ghost"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        )}
      </div>

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
                    <span className={`cc-status-badge cc-status-badge--${booking.status}`}>{booking.status}</span>
                  </div>
                  <h3 className="cc-card-title">{booking.serviceName}</h3>
                  <p className="cc-card-meta">{booking.categoryName}</p>
                  <dl className="cc-rows">
                    <div className="cc-row">
                      <dt>Customer</dt>
                      <dd>{booking.customerName} \u00B7 {booking.customerMobile}</dd>
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
                          {booking.slotTime ? ` \u00B7 ${booking.slotTime}` : ''}
                        </dd>
                      </div>
                    )}
                    {booking.amount > 0 && (
                      <div className="cc-row">
                        <dt>Amount</dt>
                        <dd>{formatINR(booking.amount)}</dd>
                      </div>
                    )}
                    {booking.couponCode && (
                      <div className="cc-row">
                        <dt>Coupon</dt>
                        <dd>{booking.couponCode} (\u2212{formatINR(booking.couponDiscount)})</dd>
                      </div>
                    )}
                    {booking.assignedTo && (
                      <div className="cc-row">
                        <dt>Assigned To</dt>
                        <dd>{booking.assignedTo}{booking.assignedPhone ? ` \u00B7 ${booking.assignedPhone}` : ''}</dd>
                      </div>
                    )}
                  </dl>

                  {assigningId === booking._id && (
                    <div className="cc-assign-form">
                      <input
                        className="cc-assign-input"
                        value={assignName}
                        onChange={(e) => setAssignName(e.target.value)}
                        placeholder="Vendor / technician name"
                      />
                      <input
                        className="cc-assign-input"
                        value={assignPhone}
                        onChange={(e) => setAssignPhone(e.target.value)}
                        placeholder="Phone (optional)"
                      />
                      <div className="cc-assign-actions">
                        <button className="cc-assign-save" onClick={() => handleAssign(booking._id)} type="button">Save</button>
                        <button className="cc-assign-cancel" onClick={() => { setAssigningId(null); setAssignName(''); setAssignPhone(''); }} type="button">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="cc-card-actions">
                  <div className="cc-card-actions-row">
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
                  <button
                    className="cc-assign-btn"
                    onClick={() => { setAssigningId(booking._id); setAssignName(booking.assignedTo || ''); setAssignPhone(booking.assignedPhone || ''); }}
                    type="button"
                  >
                    {booking.assignedTo ? 'Reassign Vendor' : 'Assign Vendor'}
                  </button>
                  <button
                    className="cc-assign-btn cc-delete-btn"
                    onClick={() => handleDelete(booking._id)}
                    type="button"
                  >
                    Delete Booking
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />{toast.message}
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

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

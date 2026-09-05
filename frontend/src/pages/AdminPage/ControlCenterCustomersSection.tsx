import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAdminCustomersAPI,
  toggleAdminCustomerAPI,
  deleteAdminCustomerAPI,
  getAdminCustomerStatsAPI,
  type AdminCustomer,
  type CustomerStats,
} from '../../api/customers';
import './ControlCenterModules.css';

export default function ControlCenterCustomersSection() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (p = page, q = query) => {
    setLoading(true);
    setError('');
    try {
      const [custRes, statsRes] = await Promise.all([
        getAdminCustomersAPI({ page: p, search: q }),
        p === 1 && !q ? getAdminCustomerStatsAPI() : null,
      ]);
      if (custRes.success && custRes.data) {
        setCustomers(custRes.data.customers);
        setTotalPages(custRes.data.pagination.totalPages);
        setTotal(custRes.data.pagination.total);
      }
      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchCustomers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1);
    setQuery(searchInput);
    fetchCustomers(1, searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await toggleAdminCustomerAPI(id);
      if (res.success && res.data) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isActive: res.data!.isActive } : c))
        );
        setStats((prev) => {
          if (!prev) return prev;
          const wasActive = customers.find((c) => c._id === id)?.isActive;
          const nowActive = res.data!.isActive;
          if (wasActive === nowActive) return prev;
          return {
            ...prev,
            active: prev.active + (nowActive ? 1 : -1),
            inactive: prev.inactive + (nowActive ? -1 : 1),
          };
        });
      }
    } catch {
      setError('Failed to update customer status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete customer "${name}" and all their data? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await deleteAdminCustomerAPI(id);
      if (res.success) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
        setTotal((prev) => prev - 1);
        setStats((prev) => {
          if (!prev) return prev;
          const wasActive = customers.find((c) => c._id === id)?.isActive;
          return {
            ...prev,
            total: prev.total - 1,
            active: prev.active - (wasActive ? 1 : 0),
            inactive: prev.inactive - (wasActive ? 0 : 1),
          };
        });
      }
    } catch {
      setError('Failed to delete customer.');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCustomers(newPage, query);
  };

  const displayStats = useMemo(() => {
    if (stats) return stats;
    return {
      total: total,
      active: customers.filter((c) => c.isActive).length,
      inactive: customers.filter((c) => !c.isActive).length,
      recentSignups: 0,
    };
  }, [stats, total, customers]);

  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Customers</h1>
        <p className="admin-dash-subtitle">
          View and manage all registered customer accounts.
        </p>
      </header>

      {/* Stats strip */}
      <div className="cc-summary-strip">
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value">{displayStats.total}</span>
          <span className="cc-summary-stat-label">Total</span>
        </div>
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value">{displayStats.active}</span>
          <span className="cc-summary-stat-label">Active</span>
        </div>
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value">{displayStats.inactive}</span>
          <span className="cc-summary-stat-label">Inactive</span>
        </div>
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value">{displayStats.recentSignups}</span>
          <span className="cc-summary-stat-label">Last 30 days</span>
        </div>
      </div>

      {/* Search */}
      <div className="admin-search cc-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="admin-search-input"
          placeholder="Search by name, mobile or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {searchInput && searchInput !== query && (
          <button type="button" className="btn btn--sm btn-ghost" onClick={handleSearch}>
            Search
          </button>
        )}
        {query && (
          <button
            type="button"
            className="btn btn--sm btn-ghost"
            onClick={() => {
              setSearchInput('');
              setQuery('');
              setPage(1);
              fetchCustomers(1, '');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="cc-notice cc-notice--error">{error}</div>
      )}

      {loading ? (
        <div className="cc-empty-state">
          <p className="cc-empty-text">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="cc-empty-state">
          <h2 className="cc-empty-title">
            {query ? 'No matches found' : 'No customer records yet'}
          </h2>
          <p className="cc-empty-text">
            {query
              ? 'Try a different name, mobile number, or email.'
              : 'Customer profiles will appear here as customers sign up.'}
          </p>
        </div>
      ) : (
        <>
          <div className="cc-list">
            {customers.map((customer) => (
              <article
                key={customer._id}
                className={`cc-card cc-card--customer${customer.isActive ? '' : ' cc-card--inactive'}`}
              >
                <div className="cc-card-avatar" aria-hidden="true">
                  {customer.fullName ? customer.fullName.trim().charAt(0).toUpperCase() : '?'}
                </div>
                <div className="cc-card-body">
                  <h3 className="cc-card-title">
                    {customer.fullName || 'Unnamed customer'}
                    {!customer.isActive && (
                      <span className="cc-tag cc-tag--inactive">Inactive</span>
                    )}
                  </h3>
                  <p className="cc-card-meta">
                    {customer.mobile ? `+91 ${customer.mobile}` : 'No mobile'} ·{' '}
                    {customer.email || 'no email'}
                  </p>
                  <p className="cc-card-sub">
                    {customer.addresses?.length ?? 0} address{(customer.addresses?.length ?? 0) === 1 ? '' : 'es'}
                    {' · '}
                    Joined {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {customer.lastLogin && (
                      <>
                        {' · '}
                        Last login {new Date(customer.lastLogin).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </>
                    )}
                  </p>
                  {customer.addresses && customer.addresses.length > 0 && (
                    <div className="cc-card-tags">
                      {customer.addresses.slice(0, 3).map((addr) => (
                        <span key={addr._id} className="cc-tag">
                          {addr.label}: {addr.city}
                        </span>
                      ))}
                      {customer.addresses.length > 3 && (
                        <span className="cc-tag">+{customer.addresses.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="cc-card-actions">
                  <button
                    type="button"
                    className={`admin-btn admin-btn--toggle btn btn--sm ${customer.isActive ? 'btn-outline' : 'btn-success'}`}
                    disabled={togglingId === customer._id}
                    onClick={() => handleToggle(customer._id)}
                  >
                    {togglingId === customer._id
                      ? '...'
                      : customer.isActive
                        ? 'Deactivate'
                        : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm btn-danger"
                    disabled={deletingId === customer._id}
                    onClick={() => handleDelete(customer._id, customer.fullName)}
                  >
                    {deletingId === customer._id ? '...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="cc-pagination">
              <button
                type="button"
                className="btn btn--sm btn-outline"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Prev
              </button>
              <span className="cc-pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn--sm btn-outline"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

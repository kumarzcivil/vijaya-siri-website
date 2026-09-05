import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAdminQuotesAPI,
  updateQuoteStatusAPI,
  updateQuoteNotesAPI,
  deleteAdminQuoteAPI,
  getAdminQuoteStatsAPI,
  type AdminQuote,
  type QuoteStats,
} from '../../api/quotes';
import './ControlCenterModules.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'closed', label: 'Closed' },
] as const;

const LOCATION_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'siruguppa', label: 'Siruguppa' },
  { value: 'adoni', label: 'Adoni' },
  { value: 'sindhanur', label: 'Sindhanur' },
] as const;

const TYPE_LABELS: Record<string, string> = {
  'new-home': 'New Home',
  renovation: 'Renovation',
  interior: 'Interior',
  commercial: 'Commercial',
  'civil-works': 'Civil Works',
};

const LOCATION_LABELS: Record<string, string> = {
  siruguppa: 'Siruguppa',
  adoni: 'Adoni',
  sindhanur: 'Sindhanur',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#1d4ed8',
  contacted: '#d97706',
  quoted: '#7c3aed',
  closed: '#16a34a',
};

export default function ControlCenterQuoteRequestsSection() {
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQuotes = useCallback(
    async (p = page, q = query, s = statusFilter, loc = locationFilter) => {
      setLoading(true);
      setError('');
      try {
        const [quoteRes, statsRes] = await Promise.all([
          getAdminQuotesAPI({ page: p, search: q, status: s || undefined, location: loc || undefined }),
          p === 1 && !q && !s && !loc ? getAdminQuoteStatsAPI() : null,
        ]);
        if (quoteRes.success && quoteRes.data) {
          setQuotes(quoteRes.data.quotes);
          setTotalPages(quoteRes.data.pagination.totalPages);
        }
        if (statsRes?.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch {
        setError('Failed to load quotes. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [page, query, statusFilter, locationFilter]
  );

  useEffect(() => {
    fetchQuotes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1);
    setQuery(searchInput);
    fetchQuotes(1, searchInput, statusFilter, locationFilter);
  };

  const handleFilterChange = (type: 'status' | 'location', value: string) => {
    if (type === 'status') setStatusFilter(value);
    else setLocationFilter(value);
    setPage(1);
    fetchQuotes(1, query, type === 'status' ? value : statusFilter, type === 'location' ? value : locationFilter);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await updateQuoteStatusAPI(id, newStatus);
      if (res.success && res.data) {
        setQuotes((prev) => prev.map((q) => (q._id === id ? { ...q, status: res.data!.status } : q)));
      }
    } catch {
      setError('Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await updateQuoteNotesAPI(id, notesDraft);
      if (res.success && res.data) {
        setQuotes((prev) => prev.map((q) => (q._id === id ? { ...q, notes: res.data!.notes } : q)));
        setEditingNotesId(null);
      }
    } catch {
      setError('Failed to save notes.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete quote from "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await deleteAdminQuoteAPI(id);
      if (res.success) {
        setQuotes((prev) => prev.filter((q) => q._id !== id));
      }
    } catch {
      setError('Failed to delete quote.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchQuotes(newPage, query, statusFilter, locationFilter);
  };

  const statsDisplay = useMemo(() => {
    if (stats) return stats;
    return { total: quotes.length, newCount: 0, contacted: 0, quoted: 0, closed: 0, unread: 0, recentCount: 0 };
  }, [stats, quotes]);

  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Quote Requests</h1>
        <p className="admin-dash-subtitle">
          View and manage all customer quote requests.
        </p>
      </header>

      {/* Stats */}
      <div className="cc-summary-strip">
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value">{statsDisplay.total}</span>
          <span className="cc-summary-stat-label">Total</span>
        </div>
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value" style={{ color: STATUS_COLORS.new }}>
            {statsDisplay.newCount}
          </span>
          <span className="cc-summary-stat-label">New</span>
        </div>
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value" style={{ color: STATUS_COLORS.contacted }}>
            {statsDisplay.contacted}
          </span>
          <span className="cc-summary-stat-label">Contacted</span>
        </div>
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value" style={{ color: STATUS_COLORS.quoted }}>
            {statsDisplay.quoted}
          </span>
          <span className="cc-summary-stat-label">Quoted</span>
        </div>
        <div className="cc-summary-stat">
          <span className="cc-summary-stat-value" style={{ color: STATUS_COLORS.closed }}>
            {statsDisplay.closed}
          </span>
          <span className="cc-summary-stat-label">Closed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="cc-filters">
        <div className="admin-search cc-search" style={{ flex: 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="admin-search-input"
            placeholder="Search name, email, mobile, ref ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchInput && searchInput !== query && (
            <button type="button" className="btn btn--sm btn-ghost" onClick={handleSearch}>Search</button>
          )}
          {query && (
            <button
              type="button"
              className="btn btn--sm btn-ghost"
              onClick={() => { setSearchInput(''); setQuery(''); setPage(1); fetchQuotes(1, '', statusFilter, locationFilter); }}
            >
              Clear
            </button>
          )}
        </div>
        <select
          className="cc-filter-select"
          value={statusFilter}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          className="cc-filter-select"
          value={locationFilter}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        >
          {LOCATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && <div className="cc-notice cc-notice--error">{error}</div>}

      {loading ? (
        <div className="cc-empty-state"><p className="cc-empty-text">Loading quotes...</p></div>
      ) : quotes.length === 0 ? (
        <div className="cc-empty-state">
          <h2 className="cc-empty-title">{query || statusFilter || locationFilter ? 'No matches found' : 'No quote requests yet'}</h2>
          <p className="cc-empty-text">
            {query || statusFilter || locationFilter
              ? 'Try different filters or search terms.'
              : 'Quote requests will appear here as customers submit the form.'}
          </p>
        </div>
      ) : (
        <>
          <div className="cc-list">
            {quotes.map((quote) => {
              const isExpanded = expandedId === quote._id;
              return (
                <article key={quote._id} className={`cc-card cc-card--quote ${!quote.isRead ? 'cc-card--unread' : ''}`}>
                  <div className="cc-card-avatar" aria-hidden="true" style={{ background: STATUS_COLORS[quote.status] || 'var(--color-navy)' }}>
                    {quote.fullName ? quote.fullName.trim().charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="cc-card-body">
                    <div className="cc-card-topline">
                      <h3 className="cc-card-title">{quote.fullName}</h3>
                      <span className="cc-tag" style={{ color: STATUS_COLORS[quote.status], background: `${STATUS_COLORS[quote.status]}15`, border: `1px solid ${STATUS_COLORS[quote.status]}30` }}>
                        {quote.status}
                      </span>
                      {!quote.isRead && <span className="cc-badge">New</span>}
                    </div>
                    <p className="cc-card-meta">
                      {quote.refId} · +91 {quote.mobile} · {quote.email}
                    </p>
                    <p className="cc-card-sub">
                      {LOCATION_LABELS[quote.projectLocation] || quote.projectLocation} · {TYPE_LABELS[quote.projectType] || quote.projectType}
                      {quote.area ? ` · ${quote.area} sq.ft` : ''}
                      {quote.budget ? ` · ${quote.budget}` : ''}
                      {' · '}
                      {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="cc-quote-details">
                        {quote.projectDescription && (
                          <div className="cc-quote-detail-row">
                            <dt>Project Description</dt>
                            <dd>{quote.projectDescription}</dd>
                          </div>
                        )}
                        {quote.message && (
                          <div className="cc-quote-detail-row">
                            <dt>Message</dt>
                            <dd>{quote.message}</dd>
                          </div>
                        )}
                        {quote.whatsapp && (
                          <div className="cc-quote-detail-row">
                            <dt>WhatsApp</dt>
                            <dd>+91 {quote.whatsapp}</dd>
                          </div>
                        )}
                        {quote.notes && (
                          <div className="cc-quote-detail-row">
                            <dt>Notes</dt>
                            <dd>{quote.notes}</dd>
                          </div>
                        )}

                        {/* Notes editor */}
                        {editingNotesId === quote._id ? (
                          <div className="cc-quote-notes-editor">
                            <textarea
                              className="cc-quote-notes-input"
                              rows={3}
                              placeholder="Add internal notes..."
                              value={notesDraft}
                              onChange={(e) => setNotesDraft(e.target.value)}
                            />
                            <div className="cc-quote-notes-actions">
                              <button
                                type="button"
                                className="btn btn--sm btn-ghost"
                                onClick={() => setEditingNotesId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn--sm btn-primary"
                                disabled={actionLoading === quote._id}
                                onClick={() => handleSaveNotes(quote._id)}
                              >
                                Save Notes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--sm btn-ghost"
                            onClick={() => {
                              setEditingNotesId(quote._id);
                              setNotesDraft(quote.notes || '');
                            }}
                          >
                            {quote.notes ? 'Edit Notes' : '+ Add Notes'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="cc-card-actions cc-card-actions--status">
                    <span className="cc-status-label">Status</span>
                    <div className="cc-status-btns">
                      {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          className={`cc-status-btn ${quote.status === o.value ? 'cc-status-btn--active' : ''}`}
                          disabled={actionLoading === quote._id}
                          onClick={() => handleStatusUpdate(quote._id, o.value)}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <div className="cc-quote-row-actions">
                      <button
                        type="button"
                        className="btn btn--sm btn-ghost"
                        onClick={() => setExpandedId(isExpanded ? null : quote._id)}
                      >
                        {isExpanded ? 'Less' : 'Details'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn-danger"
                        disabled={actionLoading === quote._id}
                        onClick={() => handleDelete(quote._id, quote.fullName)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="cc-pagination">
              <button type="button" className="btn btn--sm btn-outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>Prev</button>
              <span className="cc-pagination-info">Page {page} of {totalPages}</span>
              <button type="button" className="btn btn--sm btn-outline" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchServices, type SearchResult, type SearchResults } from '../../api/search';
import Icon from '../../components/Icon/Icon';
import './SearchPage.css';

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<SearchResults>({ quickFix: [], proFix: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ quickFix: [], proFix: [] });
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    searchServices(query)
      .then((data) => setResults(data))
      .catch(() => setResults({ quickFix: [], proFix: [] }))
      .finally(() => setLoading(false));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSearchParams({});
  };

  const totalResults = results.quickFix.length + results.proFix.length;

  return (
    <div className="search-page">
      <div className="section-container">
        <header className="search-header">
          <h1 className="search-title">Search Services</h1>
          <p className="search-subtitle">
            Find the right service for your home from Quick Fix and Pro Fix.
          </p>
        </header>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrap">
            <svg className="search-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search for AC repair, plumbing, painting..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            {inputValue && (
              <button type="button" className="search-clear-btn" onClick={handleClear} aria-label="Clear search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </form>

        {loading ? (
          <div className="search-loading">
            <p>Searching for &quot;{query}&quot;...</p>
          </div>
        ) : hasSearched && totalResults === 0 ? (
          <div className="search-empty">
            <span className="search-empty-icon">
              <Icon name="search" size={40} />
            </span>
            <h2 className="search-empty-title">No results found</h2>
            <p className="search-empty-text">
              We couldn&apos;t find any services matching &quot;{query}&quot;.
              Try different keywords or browse our categories.
            </p>
            <div className="search-empty-actions">
              <Link to="/quick-fix" className="search-empty-link">Browse Quick Fix</Link>
              <Link to="/pro-fix" className="search-empty-link">Browse Pro Fix</Link>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="search-results">
            <p className="search-results-count">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found for &quot;{query}&quot;
            </p>

            {results.quickFix.length > 0 && (
              <section className="search-results-section">
                <h2 className="search-results-heading">
                  <Icon name="wrench" size={18} />
                  Quick Fix Services
                  <span className="search-results-badge">{results.quickFix.length}</span>
                </h2>
                <div className="search-results-grid">
                  {results.quickFix.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </section>
            )}

            {results.proFix.length > 0 && (
              <section className="search-results-section">
                <h2 className="search-results-heading">
                  <Icon name="building" size={18} />
                  Pro Fix Services
                  <span className="search-results-badge">{results.proFix.length}</span>
                </h2>
                <div className="search-results-grid">
                  {results.proFix.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="search-initial">
            <span className="search-initial-icon">
              <Icon name="search" size={48} />
            </span>
            <h2 className="search-initial-title">What are you looking for?</h2>
            <p className="search-initial-text">
              Search from our wide range of home services including AC repair, plumbing, painting, flooring, and more.
            </p>
            <div className="search-suggestions">
              <span className="search-suggestions-label">Popular searches:</span>
              <div className="search-suggestions-list">
                {['AC Repair', 'Plumbing', 'Painting', 'Flooring', 'Electrical'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="search-suggestion-chip"
                    onClick={() => {
                      setInputValue(term);
                      setSearchParams({ q: term });
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: SearchResult }) {
  const navigate = useNavigate();
  const isQuickFix = service.type === 'quick-fix';

  return (
    <article
      className="search-service-card"
      onClick={() => navigate(service.url)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(service.url); }}
    >
      <div className="search-service-img">
        {service.image ? (
          <img src={service.image} alt={service.name} loading="lazy" />
        ) : (
          <span className="search-service-img-fallback">
            <Icon name={isQuickFix ? 'wrench' : 'building'} size={24} />
          </span>
        )}
        <span className={`search-service-type search-service-type--${service.type}`}>
          {isQuickFix ? 'Quick Fix' : 'Pro Fix'}
        </span>
      </div>
      <div className="search-service-body">
        <h3 className="search-service-name">{service.name}</h3>
        {service.category && (
          <p className="search-service-category">{service.category}</p>
        )}
        {service.description && (
          <p className="search-service-desc">{service.description}</p>
        )}
        <div className="search-service-footer">
          {isQuickFix && service.price != null && (
            <span className="search-service-price">{formatINR(service.price)}</span>
          )}
          {!isQuickFix && service.startingPrice && (
            <span className="search-service-price">From {formatINR(Number(service.startingPrice))}</span>
          )}
          {service.duration && (
            <span className="search-service-duration">{service.duration}</span>
          )}
        </div>
      </div>
    </article>
  );
}

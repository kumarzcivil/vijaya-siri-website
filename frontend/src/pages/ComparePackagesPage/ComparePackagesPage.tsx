import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPackages, packageSpecMatrix, rowHasDifferences } from '../../data';
import type { SpecRow } from '../../data';
import Icon from '../../components/Icon/Icon';
import './ComparePackagesPage.css';

const allPackages = getPackages();
const { categories } = packageSpecMatrix;
const fixedPackages = allPackages.filter((p) => !p.custom);

function renderSpecValue(value: SpecRow['values'][string] | undefined) {
  if (!value) return <span className="spec-to-confirm">To be updated</span>;
  if (value.type === 'included') {
    return (
      <span className="spec-check">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (value.type === 'excluded') {
    return (
      <span className="spec-cross">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    );
  }
  return <span className="spec-text">{value.text}</span>;
}

function formatPrice(pkg: typeof fixedPackages[0]): string {
  if (pkg.price === null) return 'Get Quote';
  return `${pkg.pricePrefix}${pkg.price.toLocaleString('en-IN')}`;
}

export default function ComparePackagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialHighlight = searchParams.get('highlight');
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialHighlight && fixedPackages.some((p) => p.id === initialHighlight)) {
      return [initialHighlight];
    }
    return fixedPackages.map((p) => p.id);
  });

  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((c, i) => { initial[c.id] = i === 0; });
    return initial;
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight && fixedPackages.some((p) => p.id === highlight)) {
      setSelectedIds((prev) => {
        if (prev.includes(highlight)) return prev;
        return [...prev, highlight];
      });
    }
  }, [searchParams]);

  // Persist accordion state
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('compare_expanded');
      if (stored) setExpandedCategories(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('compare_expanded', JSON.stringify(expandedCategories));
    } catch { /* ignore */ }
  }, [expandedCategories]);

  const selectedPackages = useMemo(
    () => fixedPackages.filter((p) => selectedIds.includes(p.id)),
    [selectedIds]
  );

  const togglePackage = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const visibleCategories = useMemo(() => {
    if (!highlightDiffs) return categories.map((cat) => ({ cat, rows: cat.rows }));
    return categories
      .map((cat) => ({
        cat,
        rows: cat.rows.filter((row) => rowHasDifferences(row, selectedIds)),
      }))
      .filter((entry) => entry.rows.length > 0);
  }, [highlightDiffs, selectedIds]);

  const handleBack = () => {
    navigate('/projects#packages');
  };

  const handleGetQuote = () => {
    navigate('/quote');
  };

  return (
    <div className="compare-page">
      <div className="section-container">
        {/* Back link */}
        <button type="button" className="compare-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Packages
        </button>

        {/* Header */}
        <div className="compare-header">
          <span className="compare-label">Compare Packages</span>
          <h1 className="compare-title">Compare Packages</h1>
          <p className="compare-subtitle">
            Compare what's included in each package and choose the right fit for
            your home, lifestyle and budget.
          </p>
        </div>

        {/* Sticky controls on mobile */}
        <div className="compare-controls">
          {/* Package selector */}
          <div className="compare-selector">
            {fixedPackages.map((pkg) => {
              const isSelected = selectedIds.includes(pkg.id);
              return (
                <button
                  key={pkg.id}
                  type="button"
                  className={`compare-selector-btn ${isSelected ? 'compare-selector-btn--active' : ''} ${pkg.popular ? 'compare-selector-btn--popular' : ''}`}
                  onClick={() => togglePackage(pkg.id)}
                  aria-pressed={isSelected}
                >
                  {pkg.popular && <span className="compare-selector-badge">Most Popular</span>}
                  <span className="compare-selector-name">{pkg.comparisonName}</span>
                  <span className="compare-selector-price">{formatPrice(pkg)}</span>
                  <span className="compare-selector-unit">{pkg.priceUnit}</span>
                  {isSelected ? (
                    <svg className="compare-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="compare-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </button>
              );
            })}
            <div className="compare-selector-btn compare-selector-btn--custom">
              <span className="compare-selector-name">Custom</span>
              <span className="compare-custom-note">Talk to us for a custom comparison</span>
            </div>
          </div>

          {/* Highlight differences toggle */}
          <div className="compare-toggle-row">
            <button
              type="button"
              className={`compare-toggle ${highlightDiffs ? 'compare-toggle--on' : ''}`}
              onClick={() => setHighlightDiffs((prev) => !prev)}
              role="switch"
              aria-checked={highlightDiffs}
              aria-label="Highlight differences"
            >
              <span className="compare-toggle-track">
                <span className="compare-toggle-thumb" />
              </span>
              <span className="compare-toggle-label">Highlight differences</span>
            </button>
          </div>
        </div>

        {selectedPackages.length === 0 && (
          <div className="compare-empty">
            <p>Select at least one package to compare.</p>
          </div>
        )}

        {/* Desktop/Tablet: comparison table */}
        {selectedPackages.length > 0 && (
          <div className="compare-table-wrapper">
            <table className="compare-desktop-table">
              <thead>
                <tr>
                  <th className="compare-th-label">
                    <span className="compare-th-label-text">Feature</span>
                  </th>
                  {selectedPackages.map((pkg) => (
                    <th key={pkg.id} className={`compare-th-pkg ${pkg.popular ? 'compare-th-pkg--popular' : ''}`}>
                      {pkg.popular && <span className="compare-th-badge">Most Popular</span>}
                      <span className="compare-th-name">{pkg.comparisonName}</span>
                      <span className="compare-th-price">{formatPrice(pkg)}</span>
                      <span className="compare-th-unit">{pkg.priceUnit}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map(({ cat, rows }) => (
                  <CategorySection key={cat.id} cat={cat} rows={rows} selectedPackages={selectedPackages} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile: accordion cards */}
        {selectedPackages.length > 0 && (
          <div className="compare-mobile">
            {visibleCategories.map(({ cat, rows }) => {
              const isExpanded = expandedCategories[cat.id] !== false;
              return (
                <div key={cat.id} className="compare-mobile-category">
                  <button
                    type="button"
                    className="compare-mobile-cat-header"
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="compare-mobile-cat-header-left">
                      <h3 className="compare-mobile-cat-title">{cat.title}</h3>
                      {cat.subtitle && <span className="compare-mobile-cat-subtitle">{cat.subtitle}</span>}
                    </div>
                    <svg className={`compare-mobile-cat-arrow ${isExpanded ? 'compare-mobile-cat-arrow--open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="compare-mobile-cat-body">
                      {rows.map((row) => (
                        <div key={row.id} className="compare-mobile-spec">
                          <div className="compare-mobile-spec-header">
                            <span className="compare-mobile-spec-label">{row.label}</span>
                            {row.reference && <span className="compare-mobile-spec-ref">{row.reference}</span>}
                          </div>
                          <div className="compare-mobile-spec-values">
                            {selectedPackages.map((pkg) => {
                              const val = row.values[pkg.id];
                              return (
                                <div key={pkg.id} className="compare-mobile-spec-value">
                                  <span className="compare-mobile-spec-pkg">{pkg.comparisonName}</span>
                                  <div className="compare-mobile-spec-val">
                                    {renderSpecValue(val)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="compare-bottom-cta">
          <p className="compare-cta-heading">Ready to choose your package?</p>
          <div className="compare-cta-buttons">
            <button type="button" className="compare-cta-primary" onClick={handleGetQuote}>
              <Icon name="phone" size={18} />
              Get Free Quote
            </button>
            <a href="tel:+919008855088" className="compare-cta-secondary">
              <Icon name="phone" size={18} />
              Talk to an Expert
            </a>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="compare-mobile-sticky-cta">
        <button type="button" className="compare-mobile-cta-btn" onClick={handleGetQuote}>
          <Icon name="phone" size={18} />
          Get Free Quote
        </button>
      </div>
    </div>
  );
}

function CategorySection({ cat, rows, selectedPackages }: {
  cat: { id: string; title: string; subtitle?: string };
  rows: SpecRow[];
  selectedPackages: typeof fixedPackages;
}) {
  return (
    <>
      <tr className="compare-cat-row">
        <td colSpan={selectedPackages.length + 1} className="compare-cat-label">
          <span className="compare-cat-title">{cat.title}</span>
          {cat.subtitle && <span className="compare-cat-subtitle">{cat.subtitle}</span>}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id} className="compare-row">
          <td className="compare-td-label">
            <span className="compare-td-label-text">{row.label}</span>
            {row.reference && <span className="compare-td-ref">{row.reference}</span>}
          </td>
          {selectedPackages.map((pkg) => (
            <td key={pkg.id} className={`compare-td-value ${pkg.popular ? 'compare-td-value--popular' : ''}`}>
              {renderSpecValue(row.values[pkg.id])}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchPackages, type Package } from '../../api/packages';
import Icon from '../../components/Icon/Icon';
import './ComparePackagesPage.css';

type SpecValue = { type: 'text' | 'included' | 'excluded'; text?: string };

interface SpecRow {
  id: string;
  label: string;
  reference?: string;
  values: Record<string, SpecValue>;
}

interface SpecCategory {
  id: string;
  title: string;
  subtitle?: string;
  rows: SpecRow[];
}

interface UIPackage {
  _id: string;
  name: string;
  comparisonName: string;
  price: number | null;
  pricePrefix: string;
  priceUnit: string;
  tagline: string;
  description: string;
  features: string[];
  popular?: boolean;
}

function parseSpecValue(raw: string): SpecValue {
  const lower = raw.toLowerCase().trim();
  if (lower === 'yes' || lower === 'included') return { type: 'included' };
  if (lower === 'no' || lower === 'excluded') return { type: 'excluded' };
  return { type: 'text', text: raw };
}

function buildMatrix(packages: Package[]): { uiPackages: UIPackage[]; categories: SpecCategory[] } {
  const uiPackages: UIPackage[] = packages.map((p) => ({
    _id: p._id,
    name: p.name,
    comparisonName: p.comparisonName || p.name,
    price: p.pricePerSqFt,
    pricePrefix: p.pricePrefix || '\u20B9',
    priceUnit: p.priceUnit || 'per sq.ft',
    tagline: p.tagline || '',
    description: p.description || '',
    features: p.features || [],
    popular: p.popular || p.isDefault,
  }));

  const categoryMap = new Map<string, SpecCategory>();

  for (const pkg of packages) {
    for (const spec of pkg.specs) {
      const catId = spec.category.toLowerCase().replace(/\s+/g, '_');
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          id: catId,
          title: spec.category,
          rows: [],
        });
      }
      const cat = categoryMap.get(catId)!;
      const rowMap = new Map(cat.rows.map((r) => [r.label, r]));

      for (const row of spec.rows) {
        if (!rowMap.has(row.label)) {
          rowMap.set(row.label, {
            id: row.label.toLowerCase().replace(/\s+/g, '_'),
            label: row.label,
            values: {},
          });
        }
        rowMap.get(row.label)!.values[pkg._id] = parseSpecValue(row.value);
      }

      cat.rows = Array.from(rowMap.values());
    }
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) => {
    const orderA = packages[0]?.specs.findIndex((s) => s.category === a.title) ?? 0;
    const orderB = packages[0]?.specs.findIndex((s) => s.category === b.title) ?? 0;
    return orderA - orderB;
  });

  return { uiPackages, categories };
}

function rowHasDifferences(row: SpecRow, packageIds: string[]): boolean {
  if (packageIds.length < 2) return false;
  const values = packageIds.map((id) => {
    const v = row.values[id];
    if (!v) return '';
    if (v.type === 'included') return '__YES__';
    if (v.type === 'excluded') return '__NO__';
    return v.text || '';
  });
  return new Set(values).size > 1;
}

function renderSpecValue(value: SpecValue | undefined) {
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

function formatPrice(pkg: UIPackage): string {
  if (pkg.price === null) return 'Get Quote';
  return `${pkg.pricePrefix}${pkg.price.toLocaleString('en-IN')}`;
}

export default function ComparePackagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages()
      .then((data) => setAllPackages(data.filter((p) => p.status === 'active')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { uiPackages: fixedPackages, categories } = useMemo(
    () => buildMatrix(allPackages),
    [allPackages]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((c, i) => { initial[c.id] = i === 0; });
    return initial;
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (fixedPackages.length > 0 && selectedIds.length === 0) {
      const highlight = searchParams.get('highlight');
      if (highlight && fixedPackages.some((p) => p._id === highlight)) {
        setSelectedIds([highlight]);
      } else {
        setSelectedIds(fixedPackages.map((p) => p._id));
      }
    }
  }, [fixedPackages, selectedIds.length, searchParams]);

  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight && fixedPackages.some((p) => p._id === highlight)) {
      setSelectedIds((prev) => {
        if (prev.includes(highlight)) return prev;
        return [...prev, highlight];
      });
    }
  }, [searchParams, fixedPackages]);

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
    () => fixedPackages.filter((p) => selectedIds.includes(p._id)),
    [selectedIds, fixedPackages]
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
  }, [highlightDiffs, selectedIds, categories]);

  const handleBack = () => {
    navigate('/projects#packages');
  };

  const handleGetQuote = () => {
    navigate('/quote');
  };

  if (loading) {
    return (
      <div className="compare-page">
        <div className="section-container">
          <div className="compare-empty">
            <p>Loading packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="section-container">
        <button type="button" className="compare-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Packages
        </button>

        <div className="compare-header">
          <span className="compare-label">Compare Packages</span>
          <h1 className="compare-title">Compare Packages</h1>
          <p className="compare-subtitle">
            Compare what's included in each package and choose the right fit for
            your home, lifestyle and budget.
          </p>
        </div>

        <div className="compare-controls">
          <div className="compare-selector">
            {fixedPackages.map((pkg) => {
              const isSelected = selectedIds.includes(pkg._id);
              return (
                <button
                  key={pkg._id}
                  type="button"
                  className={`compare-selector-btn ${isSelected ? 'compare-selector-btn--active' : ''} ${pkg.popular ? 'compare-selector-btn--popular' : ''}`}
                  onClick={() => togglePackage(pkg._id)}
                  aria-pressed={isSelected}
                >
                  {pkg.popular && <span className="compare-selector-badge">Most Popular</span>}
                  <span className="compare-selector-name">{pkg.comparisonName}</span>
                  <span className="compare-selector-price">{formatPrice(pkg)}</span>
                  <span className="compare-selector-unit">per sq.ft</span>
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

        {selectedPackages.length > 0 && (
          <>
            {/* Package Overview Cards */}
            <div className="compare-overview-grid">
              {selectedPackages.map((pkg) => (
                <div key={pkg._id} className={`compare-overview-card ${pkg.popular ? 'compare-overview-card--popular' : ''}`}>
                  {pkg.popular && <span className="compare-overview-badge">Most Popular</span>}
                  <h3 className="compare-overview-name">{pkg.comparisonName}</h3>
                  <div className="compare-overview-price">
                    <span className="compare-overview-amount">{formatPrice(pkg)}</span>
                    <span className="compare-overview-unit">{pkg.priceUnit}</span>
                  </div>
                  {pkg.tagline && <p className="compare-overview-tagline">{pkg.tagline}</p>}
                  {pkg.features.length > 0 && (
                    <ul className="compare-overview-features">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="compare-overview-feature">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="compare-table-wrapper">
              <table className="compare-desktop-table">
                <thead>
                  <tr>
                    <th className="compare-th-label">
                      <span className="compare-th-label-text">Feature</span>
                    </th>
                    {selectedPackages.map((pkg) => (
                      <th key={pkg._id} className={`compare-th-pkg ${pkg.popular ? 'compare-th-pkg--popular' : ''}`}>
                        {pkg.popular && <span className="compare-th-badge">Most Popular</span>}
                        <span className="compare-th-name">{pkg.comparisonName}</span>
                        <span className="compare-th-price">{formatPrice(pkg)}</span>
                        <span className="compare-th-unit">per sq.ft</span>
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

            {/* Mobile Cards */}
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
                                const val = row.values[pkg._id];
                                return (
                                  <div key={pkg._id} className="compare-mobile-spec-value">
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
          </>
        )}

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
  selectedPackages: UIPackage[];
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
            <td key={pkg._id} className={`compare-td-value ${pkg.popular ? 'compare-td-value--popular' : ''}`}>
              {renderSpecValue(row.values[pkg._id])}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

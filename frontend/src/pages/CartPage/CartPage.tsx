import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Icon from '../../components/Icon/Icon';
import './CartPage.css';

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function CartPage() {
  const { items, count, total, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="section-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <Icon name="shopping-cart" size={48} />
            </div>
            <h1 className="cart-empty-title">Your cart is empty</h1>
            <p className="cart-empty-desc">Browse our services and add something you need.</p>
            <div className="cart-empty-actions">
              <Link to="/quick-fix" className="cart-btn cart-btn--primary">Quick Fix Services</Link>
              <Link to="/pro-fix" className="cart-btn cart-btn--secondary">Pro Fix Services</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const siteVisitTotal = items.reduce((s, i) => s + (i.siteVisitCharge || 0), 0);
  const servicesTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="cart-page">
      <div className="section-container">
        <div className="cart-header">
          <h1 className="cart-title">Your Cart</h1>
          <span className="cart-count">{count} {count === 1 ? 'item' : 'items'}</span>
          <button className="cart-clear-btn" onClick={clearCart} type="button">Clear all</button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div key={`${item.kind}-${item.serviceId}`} className="cart-item">
                  {item.image ? (
                    <img src={item.image} alt={item.serviceName} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-img-placeholder">
                      <Icon name={item.kind === 'quick-fix' ? 'zap' : 'building'} size={24} />
                    </div>
                  )}
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <div>
                        <span className="cart-item-kind">{item.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix'}</span>
                        <h3 className="cart-item-name">{item.serviceName}</h3>
                        {item.categoryName && <p className="cart-item-category">{item.categoryName}</p>}
                      </div>
                      <button className="cart-item-remove" onClick={() => removeItem(item.serviceId, item.kind)} type="button" aria-label="Remove item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <div className="cart-item-bottom">
                      <div className="cart-item-qty">
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.serviceId, item.kind, item.quantity - 1)}
                          disabled={item.quantity <= (item.minQuantity || 1)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.serviceId, item.kind, item.quantity + 1)}
                          disabled={item.quantity >= (item.maxQuantity || 99)}
                          type="button"
                        >
                          +
                        </button>
                        {item.unit && <span className="cart-item-unit">{item.unit}</span>}
                      </div>
                      <div className="cart-item-price">
                        <span className="cart-price-unit">{formatINR(item.price)} / {item.unit}</span>
                        <span className="cart-price-total">{formatINR(itemTotal)}</span>
                      </div>
                    </div>
                    {item.siteVisitCharge ? (
                      <p className="cart-item-note">+ {formatINR(item.siteVisitCharge)} site visit charge</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Services ({count})</span>
                <span>{formatINR(servicesTotal)}</span>
              </div>
              {siteVisitTotal > 0 && (
                <div className="cart-summary-row">
                  <span>Site visit charges</span>
                  <span>{formatINR(siteVisitTotal)}</span>
                </div>
              )}
              <div className="cart-summary-divider" />
              <div className="cart-summary-row cart-summary-row--total">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
            <button className="cart-btn cart-btn--checkout" onClick={() => navigate('/checkout')} type="button">
              Proceed to Checkout
              <Icon name="arrow-right" size={16} />
            </button>
            <Link to="/quick-fix" className="cart-continue-link">Continue shopping</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

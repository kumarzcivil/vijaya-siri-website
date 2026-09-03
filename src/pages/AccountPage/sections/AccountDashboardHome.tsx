import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { getCustomer } from '../../../data/customerStore';
import { clearCustomerSignedIn } from '../../../data/customerAuth';
import { useBookingsRegistry } from '../../../hooks/useBookingsRegistry';
import { useNotifications } from '../../../hooks/useNotifications';
import { formatINR } from '../../../data/profix';

export default function AccountDashboardHome() {
  const { customerId } = useOutletContext<{ customerId: string }>();
  const profile = getCustomer(customerId);
  const navigate = useNavigate();
  const bookings = useBookingsRegistry().filter((b) => !b.customerId || b.customerId === customerId);
  const notifications = useNotifications();
  const unread = notifications.filter((n) => !n.read && (!n.customerId || n.customerId === customerId)).length;
  const upcoming = bookings.filter((b) => b.status === 'upcoming').length;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.amount : 0), 0);

  const handleSignOut = () => {
    clearCustomerSignedIn();
    navigate('/login');
  };

  const tiles = [
    {
      to: '/account/profile',
      icon: 'users',
      title: 'Profile',
      text: profile?.fullName?.trim() || 'Add your name & contact details',
    },
    {
      to: '/account/addresses',
      icon: 'map-pin',
      title: 'Addresses',
      text: 'Manage delivery & service addresses',
    },
    {
      to: '/account/offers',
      icon: 'diamond',
      title: 'Offers & Coupons',
      text: 'Browse active offers and promo codes',
    },
    {
      to: '/account/notifications',
      icon: 'bell',
      title: 'Notifications',
      text: unread > 0 ? `${unread} unread update${unread > 1 ? 's' : ''}` : 'No unread updates',
    },
    {
      to: '/account/payment-preferences',
      icon: 'cash',
      title: 'Payment Preferences',
      text: 'Saved UPI, cards & cash preference',
    },
    {
      to: '/account/security',
      icon: 'shield-check',
      title: 'Security',
      text: 'Change password & review sign-in',
    },
    {
      to: '/account/support',
      icon: 'phone',
      title: 'Support',
      text: 'Get help or reach our team',
    },
    {
      to: '/bookings',
      icon: 'receipt',
      title: 'My Bookings',
      text: `${bookings.length} booking${bookings.length === 1 ? '' : 's'} · ${upcoming} upcoming`,
    },
    {
      to: '/projects',
      icon: 'folder',
      title: 'My Projects',
      text: 'View your ongoing and completed projects',
    },
    {
      icon: 'log-out',
      title: 'Sign Out',
      text: 'Sign out of your account',
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="acc-dash-home">
      <div className="acc-dash-stats">
        <div className="acc-stat">
          <span className="acc-stat-label">Total Bookings</span>
          <span className="acc-stat-value">{bookings.length}</span>
        </div>
        <div className="acc-stat">
          <span className="acc-stat-label">Upcoming</span>
          <span className="acc-stat-value">{upcoming}</span>
        </div>
        <div className="acc-stat">
          <span className="acc-stat-label">Paid Amount</span>
          <span className="acc-stat-value">{formatINR(totalSpent)}</span>
        </div>
      </div>

      <div className="acc-tiles">
        {tiles.map((tile) => {
          const content = (
            <>
              <span className="acc-tile-icon" aria-hidden="true">
                <IconGlyph name={tile.icon} />
              </span>
              <span className="acc-tile-body">
                <span className="acc-tile-title">{tile.title}</span>
                <span className="acc-tile-text">{tile.text}</span>
              </span>
              <span className="acc-tile-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </>
          );
          if ('onClick' in tile && tile.onClick) {
            return (
              <button key={tile.title} type="button" className="acc-tile acc-tile--btn" onClick={tile.onClick}>
                {content}
              </button>
            );
          }
          return (
            <Link key={tile.to} to={tile.to} className="acc-tile">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function IconGlyph({ name }: { name: string }) {
  switch (name) {
    case 'users':
      return (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case 'map-pin':
      return (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      );
    case 'diamond':
      return <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />;
    case 'bell':
      return (
        <>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </>
      );
    case 'cash':
      return (
        <>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01" />
          <path d="M18 12h.01" />
        </>
      );
    case 'shield-check':
      return (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </>
      );
    case 'phone':
      return (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      );
    case 'receipt':
      return (
        <>
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <path d="M8 10h8" />
          <path d="M8 14h4" />
        </>
      );
    case 'folder':
      return (
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      );
    case 'log-out':
      return (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </>
      );
    default:
      return (
        <>
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <path d="M8 10h8" />
          <path d="M8 14h4" />
        </>
      );
  }
}

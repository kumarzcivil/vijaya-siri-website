import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import './AccountPage.css';

export default function AccountPage() {
  return (
    <div className="account-page">
      <div className="section-container">
        <div className="account-card">
          <span className="account-icon">
            <Icon name="users" size={28} />
          </span>
          <h1 className="account-title">My Account</h1>
          <p className="account-subtitle">
            Sign in to view your bookings, saved projects and preferences.
          </p>
          <p className="account-note">Account features are coming soon.</p>
          <Link to="/" className="account-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

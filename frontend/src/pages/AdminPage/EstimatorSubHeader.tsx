import { Link } from 'react-router-dom';
import './AdminShell.css';
import './EstimatorModule.css';

export default function EstimatorSubHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="est-header">
      <Link to="/admin/estimator" className="est-back-link">
        <span className="est-back-link-icon" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </span>
        Back to Estimator
      </Link>
      <div className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">{title}</h1>
        <p className="admin-dash-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
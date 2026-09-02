import { NavLink } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import './AdminShell.css';
import './EstimatorModule.css';

interface EstimatorCard {
  to: string;
  icon: string;
  title: string;
  desc: string;
  cta: string;
}

const ESTIMATOR_CARDS: EstimatorCard[] = [
  {
    to: '/admin/estimator/project',
    icon: 'calculator',
    title: 'Project Estimator',
    desc: 'Generate detailed estimates for residential construction projects.',
    cta: 'Create Estimate',
  },
  {
    to: '/admin/estimator/templates',
    icon: 'clipboard',
    title: 'Estimate Templates',
    desc: 'Manage reusable quotation structures for common small works.',
    cta: 'View Templates',
  },
];

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function EstimatorModule() {
  return (
    <div className="cc-page est-page">
      <div className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Estimator</h1>
        <p className="admin-dash-subtitle">
          Create project estimates and manage quotation templates.
        </p>
      </div>

      <div className="est-grid">
        {ESTIMATOR_CARDS.map((card) => (
          <NavLink key={card.to} to={card.to} className="est-card">
            <span className="est-card-icon" aria-hidden="true">
              <Icon name={card.icon} size={24} />
            </span>
            <span className="est-card-title">{card.title}</span>
            <span className="est-card-desc">{card.desc}</span>
            <span className="est-card-cta">
              {card.cta}
              <ArrowIcon />
            </span>
          </NavLink>
        ))}
      </div>

      <p className="est-note est-note--center">
        Quantities are calculated on this device. Amounts appear once rates are
        configured in the Pricing &amp; Rates system.
      </p>
    </div>
  );
}
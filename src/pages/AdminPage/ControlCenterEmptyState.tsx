import type { ReactNode } from 'react';
import './AdminShell.css';
import './ControlCenterModules.css';

interface ControlCenterEmptyStateProps {
  icon: ReactNode;
  heading: string;
  description: string;
  emptyTitle: string;
  emptyText: string;
  status?: string;
}

export default function ControlCenterEmptyState({
  icon,
  heading,
  description,
  emptyTitle,
  emptyText,
  status = 'Not connected',
}: ControlCenterEmptyStateProps) {
  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">{heading}</h1>
        <p className="admin-dash-subtitle">{description}</p>
      </header>

      <div className="cc-empty-state">
        <span className="cc-empty-icon" aria-hidden="true">
          {icon}
        </span>
        <h2 className="cc-empty-title">{emptyTitle}</h2>
        <p className="cc-empty-text">{emptyText}</p>
        <span className="cc-empty-status">{status}</span>
      </div>
    </div>
  );
}
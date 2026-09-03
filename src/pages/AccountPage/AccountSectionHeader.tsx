import type { ReactNode } from 'react';

interface AccountSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function AccountSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: AccountSectionHeaderProps) {
  return (
    <div className="acc-section-header">
      <div className="acc-section-header-text">
        <span className="acc-section-eyebrow">{eyebrow}</span>
        <h1 className="acc-section-title">{title}</h1>
        <p className="acc-section-desc">{description}</p>
      </div>
      {action && <div className="acc-section-header-action">{action}</div>}
    </div>
  );
}

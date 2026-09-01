import './AdminShell.css';

interface AdminComingSoonProps {
  group?: string;
  title: string;
}

function CrumbIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function AdminComingSoon({ group, title }: AdminComingSoonProps) {
  return (
    <div className="admin-coming-soon">
      <div className="admin-coming-soon-crumb">
        {group && (
          <>
            <span>{group}</span>
            <CrumbIcon />
          </>
        )}
        <span className="admin-coming-soon-crumb-current">{title}</span>
      </div>
      <h1 className="admin-coming-soon-title">{title}</h1>
      <div className="admin-coming-soon-panel">
        <span className="admin-coming-soon-badge">Coming soon</span>
        <p className="admin-coming-soon-text">
          This section is not enabled yet. Administration for {group ? `${group} - ${title}` : title} will be
          available in a future stage.
        </p>
      </div>
    </div>
  );
}
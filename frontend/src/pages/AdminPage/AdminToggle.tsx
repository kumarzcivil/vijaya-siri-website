interface StatusToggleProps {
  active: boolean;
  onClick: () => void;
}

export default function StatusToggle({ active, onClick }: StatusToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? 'Active' : 'Inactive'}
      title={active ? 'Active' : 'Inactive'}
      className={`admin-toggle${active ? ' admin-toggle--on' : ''}`}
      onClick={onClick}
    >
      <span className="admin-toggle-track" aria-hidden="true" />
    </button>
  );
}
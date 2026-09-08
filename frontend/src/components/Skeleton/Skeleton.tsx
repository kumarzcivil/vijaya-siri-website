import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ width, height, borderRadius, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text-line"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton width="100%" height="180px" borderRadius="var(--radius-lg)" />
      <div className="skeleton-card-body">
        <Skeleton width="60%" height="16px" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-row ${className}`}>
      <Skeleton width="48px" height="48px" borderRadius="var(--radius-md)" />
      <div className="skeleton-row-body">
        <Skeleton width="50%" height="14px" />
        <Skeleton width="30%" height="12px" />
      </div>
      <Skeleton width="60px" height="32px" borderRadius="var(--radius-pill)" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`skeleton-table ${className}`}>
      <div className="skeleton-table-header">
        <Skeleton width="20%" height="14px" />
        <Skeleton width="25%" height="14px" />
        <Skeleton width="15%" height="14px" />
        <Skeleton width="15%" height="14px" />
        <Skeleton width="10%" height="14px" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-table-row">
          <Skeleton width="20%" height="13px" />
          <Skeleton width="25%" height="13px" />
          <Skeleton width="15%" height="13px" />
          <Skeleton width="15%" height="13px" />
          <Skeleton width="10%" height="13px" />
        </div>
      ))}
    </div>
  );
}

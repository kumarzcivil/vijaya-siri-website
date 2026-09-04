import { Link } from 'react-router-dom';
import './Breadcrumb.css';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const items: BreadcrumbItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Projects' },
];

export default function Breadcrumb() {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <div className="section-container">
        <ol className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {item.path ? (
                <Link to={item.path} className="breadcrumb-link">{item.label}</Link>
              ) : (
                <span className="breadcrumb-current" aria-current="page">{item.label}</span>
              )}
              {index < items.length - 1 && (
                <svg className="breadcrumb-separator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

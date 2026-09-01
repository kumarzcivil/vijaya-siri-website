import type { Category } from '../../data';
import Icon from '../Icon/Icon';
import './CategoryCard.css';

interface CategoryCardProps {
  category: Category;
  onSelect: (id: string) => void;
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  return (
    <button
      className="category-card"
      onClick={() => onSelect(category.id)}
      style={{ '--category-color': category.color } as React.CSSProperties}
    >
      <div className="category-card-icon">
        <Icon name={category.icon} size={22} className="category-svg-icon" />
      </div>
      <div className="category-card-content">
        <h3 className="category-card-name">{category.name}</h3>
        <p className="category-card-desc">{category.description}</p>
      </div>
      <div className="category-card-count">
        <span className="category-card-number">{category.projectCount}</span>
        <span className="category-card-projects">projects</span>
      </div>
      <svg className="category-card-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}

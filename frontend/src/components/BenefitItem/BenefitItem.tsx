import type { Benefit } from '../../data';
import Icon from '../Icon/Icon';
import './BenefitItem.css';

interface BenefitItemProps {
  benefit: Benefit;
}

export default function BenefitItem({ benefit }: BenefitItemProps) {
  return (
    <div className="benefit-item">
      <div className="benefit-icon">
        <Icon name={benefit.icon} size={24} className="benefit-svg-icon" />
      </div>
      <h3 className="benefit-title">{benefit.title}</h3>
      <p className="benefit-description">{benefit.description}</p>
    </div>
  );
}

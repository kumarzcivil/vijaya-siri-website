export interface Category {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: 'construction',
    name: 'Construction',
    description: 'New residential & commercial builds',
    projectCount: 124,
    icon: 'building',
    color: '#E8722A',
  },
  {
    id: 'renovation',
    name: 'Renovation',
    description: 'Home & office renovation projects',
    projectCount: 87,
    icon: 'wrench',
    color: '#1B2A4A',
  },
  {
    id: 'interiors',
    name: 'Interiors',
    description: 'Complete interior design solutions',
    projectCount: 96,
    icon: 'armchair',
    color: '#22C55E',
  },
  {
    id: 'civil-works',
    name: 'Civil Works',
    description: 'Structural & civil engineering',
    projectCount: 53,
    icon: 'bricks',
    color: '#F59E0B',
  },
  {
    id: 'commercial',
    name: 'Commercial Building',
    description: 'Office & commercial spaces',
    projectCount: 41,
    icon: 'store',
    color: '#6366F1',
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    description: 'Outdoor & garden design',
    projectCount: 38,
    icon: 'leaf',
    color: '#16A34A',
  },
];

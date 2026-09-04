export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const benefits: Benefit[] = [
  {
    id: 'quality',
    title: 'Quality Construction',
    description: 'We use only premium materials and follow strict quality standards at every stage of construction.',
    icon: 'building',
  },
  {
    id: 'ontime',
    title: 'On-Time Delivery',
    description: 'Our project management ensures your home is delivered on schedule without compromising quality.',
    icon: 'clock',
  },
  {
    id: 'transparent',
    title: 'Transparent Pricing',
    description: 'No hidden costs. Get detailed estimates upfront with complete cost breakdowns you can trust.',
    icon: 'receipt',
  },
  {
    id: 'expert',
    title: 'Expert Team',
    description: 'Experienced architects, engineers and craftsmen with decades of residential construction expertise.',
    icon: 'users',
  },
  {
    id: 'warranty',
    title: 'Warranty Coverage',
    description: 'Comprehensive structural warranty and post-construction support for your complete peace of mind.',
    icon: 'shield-check',
  },
];

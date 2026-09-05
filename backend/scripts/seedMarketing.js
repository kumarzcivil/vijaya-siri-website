import "dotenv/config";
import mongoose from 'mongoose';

import MarketingStat from '../src/models/MarketingStat.js';
import MarketingService from '../src/models/MarketingService.js';

const stats = [
  { value: '500+', label: 'Homes Built', icon: 'home', status: 'active', displayOrder: 1 },
  { value: '98%', label: 'On-Time Delivery', icon: 'clock', status: 'active', displayOrder: 2 },
  { value: '4.8', label: 'Customer Rating', icon: 'star', status: 'active', displayOrder: 3 },
  { value: '100%', label: 'Satisfaction Guaranteed', icon: 'heart', status: 'active', displayOrder: 4 },
];

const services = [
  {
    title: 'Construction',
    subtitle: 'Building dreams from foundation to finish',
    description: 'Complete residential construction services with premium materials and expert craftsmanship.',
    icon: 'building',
    ctaLabel: 'Explore Construction',
    ctaTarget: '',
    status: 'active',
    displayOrder: 1,
  },
  {
    title: 'Renovation',
    subtitle: 'Transform your existing space',
    description: 'Professional renovation services to breathe new life into your home.',
    icon: 'wrench',
    ctaLabel: 'Explore Renovation',
    ctaTarget: '',
    status: 'active',
    displayOrder: 2,
  },
  {
    title: 'Interiors',
    subtitle: 'Create beautiful living spaces',
    description: 'Expert interior design and execution for modern homes.',
    icon: 'armchair',
    ctaLabel: 'Explore Interiors',
    ctaTarget: '',
    status: 'active',
    displayOrder: 3,
  },
  {
    title: 'Civil Works',
    subtitle: 'Infrastructure and structural solutions',
    description: 'Professional civil works including roads, drainage, and structural repairs.',
    icon: 'clipboard',
    ctaLabel: 'Explore Civil Works',
    ctaTarget: '',
    status: 'active',
    displayOrder: 4,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const statCount = await MarketingStat.countDocuments();
  if (statCount > 0) {
    console.log(`MarketingStat already has ${statCount} documents — skipping stat seed.`);
  } else {
    const createdStats = await MarketingStat.insertMany(stats);
    console.log(`Seeded ${createdStats.length} Marketing stats`);
  }

  const svcCount = await MarketingService.countDocuments();
  if (svcCount > 0) {
    console.log(`MarketingService already has ${svcCount} documents — skipping service seed.`);
  } else {
    const createdSvcs = await MarketingService.insertMany(services);
    console.log(`Seeded ${createdSvcs.length} Marketing services`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });

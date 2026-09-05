import "dotenv/config";
import mongoose from 'mongoose';
import connectDB from './connectDB.js';
import Offer from '../src/models/Offer.js';

const offers = [
  { title: 'Free Construction Consultation', subtitle: 'Get expert advice on your dream home project', description: 'Book a free consultation with our construction experts. We visit your site, understand your requirements, and provide a detailed project plan with transparent pricing.', icon: 'star', ctaLabel: 'Book Free Consult', status: 'active', priority: 1, badge: 'FREE', color: '#4CAF50' },
  { title: 'Renovation Planning', subtitle: 'Transform your existing space with expert guidance', description: 'Planning to renovate? Get a free renovation assessment from our experienced team. We evaluate your space and suggest the best improvements within your budget.', icon: 'gift', ctaLabel: 'Start Planning', status: 'active', priority: 2, badge: '', color: '#2196F3' },
  { title: 'Interior Design Consultation', subtitle: 'Create your perfect living space', description: 'Work with our interior designers to create spaces that reflect your style. Free initial consultation for all new projects.', icon: 'tag', ctaLabel: 'Explore Interiors', status: 'active', priority: 3, badge: 'POPULAR', color: '#FF9800' },
  { title: 'Seasonal Project Discount', subtitle: 'Special rates for this booking season', description: 'Take advantage of our seasonal pricing. Book your construction or renovation project now and enjoy competitive rates with flexible payment terms.', icon: 'percent', ctaLabel: 'View Offers', status: 'active', priority: 4, badge: 'LIMITED', color: '#E91E63' },
];

const seed = async () => {
  try {
    await connectDB();

    await Offer.deleteMany({});
    console.log('Cleared existing offers');

    const created = await Offer.insertMany(offers);
    console.log(`Seeded ${created.length} offers`);

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();

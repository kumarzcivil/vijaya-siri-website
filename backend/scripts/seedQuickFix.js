import "dotenv/config";
import mongoose from 'mongoose';

import QuickFixCategory from '../src/models/quickFix/QuickFixCategory.js';
import QuickFixService from '../src/models/quickFix/QuickFixService.js';
import QuickFixBanner from '../src/models/quickFix/QuickFixBanner.js';

const IMG_BASE = '/assests/Profix%20hero%20images';

const categories = [
  { name: 'Electrical', icon: 'star', active: true, displayOrder: 1 },
  { name: 'Plumbing', icon: 'clipboard', active: true, displayOrder: 2 },
  { name: 'Carpentry', icon: 'wrench', active: true, displayOrder: 3 },
  { name: 'Appliances', icon: 'armchair', active: true, displayOrder: 4 },
  { name: 'Cleaning', icon: 'leaf', active: true, displayOrder: 5 },
  { name: 'Pest Control', icon: 'shield-check', active: true, displayOrder: 6 },
  { name: 'Painting', icon: 'diamond', active: true, displayOrder: 7 },
];

const services = [
  {
    name: 'Plumbing Repair',
    categoryId: 'plumbing',
    image: { url: `${IMG_BASE}/09_Offer_Plumbing_Work.jpg`, publicId: '' },
    shortDescription: 'Leaky taps, pipes and flush tanks fixed fast.',
    description: 'Quick diagnosis and repair of common plumbing problems — leaking taps, running flush tanks, clogged drains and minor pipe leaks. Verified plumber, standard spares included.',
    includedItems: ['Leak & blockage diagnosis', 'Tap, pipe & flush tank repair', 'Standard consumable spares', 'Work-area cleanup'],
    notes: ['Major part replacement is quoted separately before work begins.'],
    pricing: { enabled: true, price: 199, priceNote: 'Visit charge included · Spares at actuals for major parts' },
    duration: { value: 60, unit: 'mins' },
    active: true,
    featured: true,
    displayOrder: 1,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'Electrical Repair',
    categoryId: 'electrical',
    image: { url: `${IMG_BASE}/08_Offer_Electrical_Work.jpg`, publicId: '' },
    shortDescription: 'Switches, sockets, fans and wiring fixed safely.',
    description: 'Safe repair of switches, sockets, fan regulators, tube lights and minor wiring faults by a verified electrician. Basic electrical consumables included.',
    includedItems: ['Fault diagnosis & safety check', 'Switch, socket & regulator repair', 'Fan & light fitting fixes', 'Minor wiring correction'],
    notes: ['Major rewiring is quoted separately after inspection.'],
    pricing: { enabled: true, price: 149, priceNote: 'Visit charge included · Parts at actuals' },
    duration: { value: 60, unit: 'mins' },
    active: true,
    featured: true,
    displayOrder: 2,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'AC Service & Repair',
    categoryId: 'appliances',
    shortDescription: 'Split & window AC cleaning, gas check and cooling fix.',
    description: 'Complete servicing for split and window ACs — filter and coil cleaning, drainage check, cooling inspection and minor repairs for smooth performance.',
    includedItems: ['Filter & coil deep cleaning', 'Drainage line check', 'Cooling performance check', 'Minor repair & troubleshooting'],
    notes: ['Gas refilling is quoted separately after inspection.'],
    pricing: { enabled: true, price: 499, priceNote: 'Per AC · Gas refilling quoted separately' },
    duration: { value: 90, unit: 'mins' },
    active: true,
    featured: true,
    displayOrder: 3,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'RO Purifier Service',
    categoryId: 'appliances',
    shortDescription: 'Filter check, membrane cleaning and sanitization.',
    description: 'Routine service for RO water purifiers — filter condition check, membrane cleaning, tank sanitization and TDS verification for safe drinking water.',
    includedItems: ['Filter condition check', 'Membrane cleaning', 'Tank sanitization', 'TDS level verification'],
    pricing: { enabled: true, price: 399, priceNote: 'Per purifier · Filter replacement at actuals' },
    duration: { value: 60, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 4,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'Carpentry Repair',
    categoryId: 'carpentry',
    shortDescription: 'Doors, hinges, locks and furniture repaired on the spot.',
    description: 'On-the-spot carpentry fixes — door alignment, hinge and lock replacement, drawer and cabinet repairs, and minor furniture fixes by a skilled carpenter.',
    includedItems: ['Door & lock adjustment', 'Hinge replacement', 'Drawer & cabinet repair', 'Minor furniture fixes'],
    pricing: { enabled: true, price: 249, priceNote: 'Visit charge included · Hardware at actuals' },
    duration: { value: 90, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 5,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'Painting Touch-up',
    categoryId: 'painting',
    image: { url: `${IMG_BASE}/10_Painting%20Work.jpg`, publicId: '' },
    shortDescription: 'Wall patches, scuffs and touch-ups blended to match.',
    description: 'Fast wall touch-up service — crack and hole patching, seepage stain covering and paint touch-ups matched to your existing wall shade.',
    includedItems: ['Crack & hole patching', 'Stain covering', 'Shade-matched touch-up', 'Area masking & cleanup'],
    pricing: { enabled: true, price: 299, priceNote: 'Up to 50 Sq.ft touch-up area' },
    duration: { value: 120, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 6,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'Home Deep Cleaning',
    categoryId: 'cleaning',
    shortDescription: 'Kitchen, bathroom and full-home deep cleaning.',
    description: 'Intensive cleaning for kitchens, bathrooms and living areas using professional tools and eco-friendly chemicals. Trained cleaning crew, equipment included.',
    includedItems: ['Kitchen degreasing', 'Bathroom descaling', 'Floor & surface scrubbing', 'Eco-friendly chemicals'],
    pricing: { enabled: true, price: 999, priceNote: '1 BHK · Larger homes quoted on confirmation' },
    duration: { value: 180, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 7,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'Pest Control Treatment',
    categoryId: 'pest-control',
    shortDescription: 'Cockroach, ant and general pest treatment.',
    description: 'Safe, odorless pest control treatment for cockroaches, ants and common household pests. Child- and pet-safe chemicals applied by trained technicians.',
    includedItems: ['Cockroach & ant treatment', 'Kitchen-safe gel application', 'Odorless chemicals', 'Post-treatment guidance'],
    pricing: { enabled: true, price: 799, priceNote: 'Up to 2 BHK · Warranty details shared on visit' },
    active: true,
    featured: false,
    displayOrder: 8,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    name: 'TV Mounting & Installation',
    categoryId: 'appliances',
    shortDescription: 'Wall mounting, bracket fixing and cable management.',
    description: 'Secure TV wall mounting with bracket installation, levelling and neat cable management for screens up to 65 inches.',
    includedItems: ['Bracket installation', 'Secure wall mounting', 'Levelling & stability check', 'Cable management'],
    notes: ['Wall mount bracket not included unless specified while booking.'],
    pricing: { enabled: true, price: 199, priceNote: 'Screens up to 65 inches · Bracket at actuals' },
    duration: { value: 45, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 9,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: false },
  },
];

const banners = [
  {
    image: { url: `${IMG_BASE}/08_Offer_Electrical_Work.jpg`, publicId: '' },
    internalName: 'QF Electrical Repairs Promo',
    active: true,
    displayOrder: 1,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    ctaLabel: 'Explore Electrical Repairs',
    destinationType: 'category',
    destination: 'electrical',
  },
  {
    image: { url: `${IMG_BASE}/09_Offer_Plumbing_Work.jpg`, publicId: '' },
    internalName: 'QF Plumbing Repair Promo',
    active: true,
    displayOrder: 2,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    ctaLabel: 'Book Plumbing Repair',
    destinationType: 'service',
    destination: 'plumbing-repair',
  },
  {
    image: { url: `${IMG_BASE}/11.%20Renovation%20Work.jpg`, publicId: '' },
    internalName: 'QF Home Repairs Brand Banner',
    active: true,
    displayOrder: 3,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    ctaLabel: '',
    destinationType: 'none',
    destination: '',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const catCount = await QuickFixCategory.countDocuments();
  if (catCount > 0) {
    console.log(`QuickFixCategory already has ${catCount} documents — skipping category seed.`);
  } else {
    const createdCats = await QuickFixCategory.insertMany(categories);
    console.log(`Seeded ${createdCats.length} QuickFix categories`);
  }

  const svcCount = await QuickFixService.countDocuments();
  if (svcCount > 0) {
    console.log(`QuickFixService already has ${svcCount} documents — skipping service seed.`);
  } else {
    const createdSvcs = await QuickFixService.insertMany(services);
    console.log(`Seeded ${createdSvcs.length} QuickFix services`);
  }

  const bannerCount = await QuickFixBanner.countDocuments();
  if (bannerCount > 0) {
    console.log(`QuickFixBanner already has ${bannerCount} documents — skipping banner seed.`);
  } else {
    const createdBanners = await QuickFixBanner.insertMany(banners);
    console.log(`Seeded ${createdBanners.length} QuickFix banners`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });

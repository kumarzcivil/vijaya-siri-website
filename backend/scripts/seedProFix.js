import "dotenv/config";
import mongoose from 'mongoose';
import connectDB from './connectDB.js';

import ProFixCategory from '../src/models/proFix/ProFixCategory.js';
import ProFixService from '../src/models/proFix/ProFixService.js';
import ProFixBanner from '../src/models/proFix/ProFixBanner.js';

const categories = [
  { name: 'Masonry & Civil', icon: 'bricks', active: true, displayOrder: 1 },
  { name: 'Flooring', icon: 'diamond', active: true, displayOrder: 2 },
  { name: 'Ceiling & Walls', icon: 'building', active: true, displayOrder: 3 },
  { name: 'Painting', icon: 'leaf', active: true, displayOrder: 4 },
  { name: 'Carpentry', icon: 'wrench', active: true, displayOrder: 5 },
  { name: 'Exterior Work', icon: 'store', active: true, displayOrder: 6 },
  { name: 'Electrical', icon: 'star', active: true, displayOrder: 7 },
  { name: 'Plumbing', icon: 'clipboard', active: true, displayOrder: 8 },
  { name: 'Others', icon: 'check-circle', active: true, displayOrder: 9 },
];

const DEFAULT_SITE_VISIT = 300;

const services = [
  {
    name: 'Plastering Work',
    category: 'masonry',
    description: 'Smooth and long-lasting wall plastering for interior and exterior surfaces.',
    active: true,
    displayOrder: 1,
    image: { url: '/assests/Profix%20hero%20images/01_Service_ProFix.jpg', publicId: '' },
    unit: 'Sq.ft',
    startingPrice: '',
    included: [
      'Surface cleaning & preparation',
      'Interior & exterior wall plastering',
      'Skilled mason team',
      'Material handling & wastage control',
      'Post-work site cleanup',
    ],
    notes: ['Final rate may vary with ceiling height and surface condition.'],
    siteVisitCharge: DEFAULT_SITE_VISIT,
    siteVisitWaiver: { enabled: true, label: 'Work Completion Waiver', amount: DEFAULT_SITE_VISIT, trigger: 'work_completion' },
    pricing: {
      enabled: true, mode: 'area_rate', rate: 45, unit: 'Sq.ft',
      quantityLabel: 'Area', defaultQuantity: 120, minQuantity: 1, maxQuantity: 100000, step: 10,
    },
  },
  {
    name: 'Tile Flooring',
    category: 'flooring',
    description: 'Professional tile installation with precision alignment and finishing.',
    active: true,
    displayOrder: 2,
    image: { url: '/assests/Profix%20hero%20images/04_Offer_Flooring_Tile_Work.jpg', publicId: '' },
    unit: 'Sq.ft',
    startingPrice: '',
    included: ['Tile layout & alignment', 'Adhesive & grouting', 'Level checking across the floor', 'Edge & corner finishing', 'Debris removal'],
    pricing: { enabled: false, mode: 'custom' },
  },
  {
    name: 'Gypsum False Ceiling',
    category: 'ceiling',
    description: 'Modern false ceiling designs with clean finishes and durable framing.',
    active: true,
    displayOrder: 3,
    image: { url: '/assests/Profix%20hero%20images/07_Offer_False_Ceiling.jpg', publicId: '' },
    unit: 'Sq.ft',
    startingPrice: '',
    included: ['Design consultation', 'GI framing & gypsum boards', 'Cove & light provision', 'Finishing & sanding', 'Site cleanup'],
    pricing: { enabled: false, mode: 'custom' },
  },
  {
    name: 'Full House Painting',
    category: 'painting',
    description: 'Complete interior and exterior painting with premium finish options.',
    active: true,
    displayOrder: 4,
    image: { url: '/assests/Profix%20hero%20images/03_Offer_House_Painting.jpg', publicId: '' },
    unit: 'Sq.ft',
    startingPrice: '',
    included: ['Surface preparation & putty', 'Primer application', 'Two coats of premium paint', 'Furniture & floor masking', 'Final inspection'],
    pricing: { enabled: false, mode: 'custom' },
  },
  {
    name: 'RMC Concrete',
    category: 'masonry',
    description: 'Ready-mix concrete supply and pouring for foundations and structures.',
    active: true,
    displayOrder: 5,
    image: { url: '/assests/Profix%20hero%20images/06_Offer_Exterior_Construction.jpg', publicId: '' },
    unit: 'Cu.m',
    startingPrice: '',
    included: ['RMC supply as per mix design', 'Pumping & pouring', 'Vibration & leveling', 'Curing guidance', 'Basic site cleanup'],
    pricing: { enabled: false, mode: 'custom' },
  },
  {
    name: 'Concrete Blocks',
    category: 'masonry',
    description: 'Quality concrete block supply and laying for walls and boundaries.',
    active: true,
    displayOrder: 6,
    image: { url: '/assests/Profix%20hero%20images/06_Offer_Exterior_Construction.jpg', publicId: '' },
    unit: 'Sq.ft',
    startingPrice: '',
    included: ['Block supply & stacking', 'Mortar preparation', 'Wall laying & alignment', 'Curing', 'Site cleanup'],
    pricing: { enabled: false, mode: 'custom' },
  },
  {
    name: 'Bathroom Renovation',
    category: 'plumbing',
    description: 'Complete bathroom remodel including tiles, fixtures, and plumbing.',
    active: true,
    displayOrder: 7,
    image: { url: '/assests/Profix%20hero%20images/02_Offer_Bathroom_Renovation.jpg', publicId: '' },
    unit: 'Unit',
    startingPrice: '',
    included: ['Site inspection & measurement', 'Tile work & waterproofing', 'Plumbing & fixture installation', 'Electrical fitting coordination', 'Final finishing'],
    pricing: { enabled: false, mode: 'custom' },
  },
  {
    name: 'Modular Kitchen',
    category: 'carpentry',
    description: 'Custom modular kitchen design, fabrication, and installation.',
    active: true,
    displayOrder: 8,
    image: { url: '/assests/Profix%20hero%20images/05_Offer_Modular_Kitchen.jpg', publicId: '' },
    unit: 'Unit',
    startingPrice: '',
    included: ['Design & 3D layout', 'Factory-finished carcass', 'Countertop & shutter installation', 'Hardware fittings', 'Post-installation cleanup'],
    pricing: { enabled: false, mode: 'custom' },
  },
];

const banners = [
  {
    eyebrow: '',
    title: 'Vijaya Siri Pro Fix',
    description: 'Vijaya Siri Pro Fix – Premium Home Services',
    image: { url: '/assests/Profix%20hero%20images/01_Service_ProFix.jpg', publicId: '' },
    ctaLabel: '',
    ctaTarget: '',
    status: 'active',
    priority: 1,
    startDate: '2000-01-01',
    endDate: '2999-12-31',
    isSeeded: true,
  },
  {
    eyebrow: '',
    title: 'Bathroom Renovation Offer',
    description: 'Bathroom Renovation – Pro Fix Offer',
    image: { url: '/assests/Profix%20hero%20images/02_Offer_Bathroom_Renovation.jpg', publicId: '' },
    ctaLabel: '',
    ctaTarget: '',
    status: 'active',
    priority: 2,
    startDate: '2000-01-01',
    endDate: '2999-12-31',
    isSeeded: true,
  },
  {
    eyebrow: '',
    title: 'House Painting Offer',
    description: 'House Painting – Pro Fix Offer',
    image: { url: '/assests/Profix%20hero%20images/03_Offer_House_Painting.jpg', publicId: '' },
    ctaLabel: '',
    ctaTarget: '',
    status: 'active',
    priority: 3,
    startDate: '2000-01-01',
    endDate: '2999-12-31',
    isSeeded: true,
  },
];

async function seed() {
  await connectDB();

  const catCount = await ProFixCategory.countDocuments();
  if (catCount > 0) {
    console.log(`ProFixCategory already has ${catCount} documents — skipping category seed.`);
  } else {
    const createdCats = await ProFixCategory.insertMany(categories);
    console.log(`Seeded ${createdCats.length} ProFix categories`);
  }

  const svcCount = await ProFixService.countDocuments();
  if (svcCount > 0) {
    console.log(`ProFixService already has ${svcCount} documents — skipping service seed.`);
  } else {
    const createdSvcs = await ProFixService.insertMany(services);
    console.log(`Seeded ${createdSvcs.length} ProFix services`);
  }

  const bannerCount = await ProFixBanner.countDocuments();
  if (bannerCount > 0) {
    console.log(`ProFixBanner already has ${bannerCount} documents — skipping banner seed.`);
  } else {
    const createdBanners = await ProFixBanner.insertMany(banners);
    console.log(`Seeded ${createdBanners.length} ProFix banners`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });

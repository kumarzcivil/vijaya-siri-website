import "dotenv/config";
import mongoose from 'mongoose';

import Package from '../src/models/Package.js';

const packages = [
  {
    name: 'Comfort',
    pricePerSqFt: 1995,
    tagline: 'A budget package with no compromise on quality that includes all construction essentials.',
    description: 'A budget package with no compromise on quality that includes all construction essentials.',
    status: 'active',
    priority: 1,
    isDefault: false,
    specs: [
      {
        category: 'Structure',
        categoryOrder: 1,
        rows: [
          { label: 'Steel', value: 'Sunvik / Prime gold / Kamdhenu / Tirumala' },
          { label: 'Cement', value: 'Zuari / Dalmia / Bharathi' },
          { label: 'Aggregates', value: 'Included' },
          { label: 'Block work', value: 'Included' },
          { label: 'RCC Mix', value: 'Included' },
          { label: 'Ceiling height', value: 'Included' },
        ],
      },
      {
        category: 'Kitchen',
        categoryOrder: 2,
        rows: [
          { label: 'Ceramic Wall Dado', value: 'Upto ₹40 per sqft' },
          { label: 'Sink', value: 'Upto ₹3000 (Single bowl SS)' },
          { label: 'Sink Faucet', value: 'Upto ₹1300' },
          { label: 'Sink Accessories', value: 'ISI Marked' },
        ],
      },
      {
        category: 'Bathroom',
        categoryOrder: 3,
        rows: [
          { label: 'Ceramic Wall Dado', value: 'Upto ₹40 per sqft' },
          { label: 'Sanitary & CP fittings', value: 'Upto ₹30,000 per 1000 sqft (Cera / equivalent)' },
          { label: 'CPVC Pipe', value: 'APL Apollo / equivalent' },
          { label: 'Bathroom doors', value: 'Included' },
          { label: 'Bathroom Accessories', value: 'Excluded' },
          { label: 'Provision for Solar water heater', value: 'Excluded' },
        ],
      },
      {
        category: 'Doors & Windows',
        categoryOrder: 4,
        rows: [
          { label: 'Main Door', value: 'Flush doors with veneer & frame with salwood upto ₹20,000 including accessories' },
          { label: 'Internal Doors', value: 'Membrane / Flush door with laminates upto ₹11,000' },
          { label: 'Puja Room Door', value: 'Excluded' },
          { label: 'Windows', value: 'Aluminium windows ₹440 per sqft of Jindal Profiles' },
          { label: 'Window grills', value: 'Included' },
        ],
      },
      {
        category: 'Painting',
        categoryOrder: 5,
        rows: [
          { label: 'Interior Painting', value: 'Tractor Emulsion' },
          { label: 'Exterior Painting', value: 'Ace Exterior Emulsion' },
        ],
      },
      {
        category: 'Flooring',
        categoryOrder: 6,
        rows: [
          { label: 'Living & Dining Flooring', value: 'Tiles upto ₹50 per sqft' },
          { label: 'Rooms and Kitchen Flooring', value: 'Tiles upto ₹50 per sqft' },
          { label: 'Balcony and Open Area', value: 'Tiles upto ₹40 per sqft' },
          { label: 'Staircase', value: 'Upto ₹70 per sqft' },
          { label: 'Parking', value: 'Tiles upto ₹40 per sqft' },
        ],
      },
      {
        category: 'Wiring',
        categoryOrder: 7,
        rows: [
          { label: 'Fireproof Wiring', value: 'Finolex / Anchor / Havells' },
          { label: 'Switch', value: 'Legrand Allzy / GM(G9) / HI-FI / Great white' },
          { label: 'Socket', value: 'Legrand Allzy / GM(G9) / HI-FI / Great white' },
          { label: 'Provision for UPS Wiring', value: 'Excluded' },
        ],
      },
    ],
  },
  {
    name: 'Premium',
    pricePerSqFt: 2145,
    tagline: 'Our best seller package with upgraded brands like Jindal Steels, Hindware etc at a considerable price.',
    description: 'Our best seller package with upgraded brands like Jindal Steels, Hindware etc at a considerable price.',
    status: 'active',
    priority: 2,
    isDefault: true,
    specs: [
      {
        category: 'Structure',
        categoryOrder: 1,
        rows: [
          { label: 'Steel', value: 'Indus / Jindal Panther / Vizag' },
          { label: 'Cement', value: 'Zuari / Dalmia / Bharathi' },
          { label: 'Aggregates', value: 'Included' },
          { label: 'Block work', value: 'Included' },
          { label: 'RCC Mix', value: 'Included' },
          { label: 'Ceiling height', value: 'Included' },
        ],
      },
      {
        category: 'Kitchen',
        categoryOrder: 2,
        rows: [
          { label: 'Ceramic Wall Dado', value: 'Upto ₹60 per sqft' },
          { label: 'Sink', value: 'Upto ₹6000 (Futura, Carysill)' },
          { label: 'Sink Faucet', value: 'Upto ₹2600' },
          { label: 'Sink Accessories', value: 'ISI Marked' },
        ],
      },
      {
        category: 'Bathroom',
        categoryOrder: 3,
        rows: [
          { label: 'Ceramic Wall Dado', value: 'Upto ₹60 per sqft' },
          { label: 'Sanitary & CP fittings', value: 'Upto ₹50,000 per 1000 sqft (Hindware / Parryware)' },
          { label: 'CPVC Pipe', value: 'APL Apollo / equivalent' },
          { label: 'Bathroom doors', value: 'Included' },
          { label: 'Bathroom Accessories', value: 'Excluded' },
          { label: 'Provision for Solar water heater', value: 'Excluded' },
        ],
      },
      {
        category: 'Doors & Windows',
        categoryOrder: 4,
        rows: [
          { label: 'Main Door', value: 'Teak Door With Teak frame of 5 inch by 3 inch, worth Rs.30,000 including fixtures.' },
          { label: 'Internal Doors', value: 'Membrane / Flush door with laminates upto ₹11,000' },
          { label: 'Puja Room Door', value: 'Excluded' },
          { label: 'Windows', value: 'UPVC windows ₹495 per sqft of Luthing / Plasto / Lesso eiti' },
          { label: 'Window grills', value: 'Included' },
        ],
      },
      {
        category: 'Painting',
        categoryOrder: 5,
        rows: [
          { label: 'Interior Painting', value: 'Tractor Shyne Emulsion' },
          { label: 'Exterior Painting', value: 'Apex Exterior Emulsion' },
        ],
      },
      {
        category: 'Flooring',
        categoryOrder: 6,
        rows: [
          { label: 'Living & Dining Flooring', value: 'Tiles / Granite upto ₹100 per sqft' },
          { label: 'Rooms and Kitchen Flooring', value: 'Tiles upto ₹80 per sqft' },
          { label: 'Balcony and Open Area', value: 'Tiles upto ₹60 per sqft' },
          { label: 'Staircase', value: 'Upto ₹80 per sqft' },
          { label: 'Parking', value: 'Tiles upto ₹50 per sqft' },
        ],
      },
      {
        category: 'Wiring',
        categoryOrder: 7,
        rows: [
          { label: 'Fireproof Wiring', value: 'Finolex / Anchor / Havells' },
          { label: 'Switch', value: 'Roma / Lisha / Legrand lyncus / Havells Fabio' },
          { label: 'Socket', value: 'Roma / Lisha / Legrand lyncus / Havells Fabio' },
          { label: 'Provision for UPS Wiring', value: 'Included' },
        ],
      },
    ],
  },
  {
    name: 'Luxury',
    pricePerSqFt: 2495,
    tagline: 'An elegant package crafted for modern living with extra provisions like solar heater setup, puja room door etc.',
    description: 'An elegant package crafted for modern living with extra provisions like solar heater setup, puja room door etc.',
    status: 'active',
    priority: 3,
    isDefault: false,
    specs: [
      {
        category: 'Structure',
        categoryOrder: 1,
        rows: [
          { label: 'Steel', value: 'Indus / Jindal Panther / Vizag' },
          { label: 'Cement', value: 'ACC / Ultratech / Ramco Supercrete' },
          { label: 'Aggregates', value: 'Included' },
          { label: 'Block work', value: 'Included' },
          { label: 'RCC Mix', value: 'ACC or Ultratech' },
          { label: 'Ceiling height', value: 'Included' },
        ],
      },
      {
        category: 'Kitchen',
        categoryOrder: 2,
        rows: [
          { label: 'Ceramic Wall Dado', value: 'Upto ₹80 per sqft' },
          { label: 'Sink', value: 'Upto ₹8000 (Futura, Carysill)' },
          { label: 'Sink Faucet', value: 'Upto ₹3500' },
          { label: 'Sink Accessories', value: 'Parryware / Hindware / Jaquar' },
        ],
      },
      {
        category: 'Bathroom',
        categoryOrder: 3,
        rows: [
          { label: 'Ceramic Wall Dado', value: 'Upto ₹80 per sqft' },
          { label: 'Sanitary & CP fittings', value: 'Upto ₹70,000 per 1000 sqft (Jaquar / equivalent)' },
          { label: 'CPVC Pipe', value: 'APL Apollo / equivalent' },
          { label: 'Bathroom doors', value: 'Included' },
          { label: 'Bathroom Accessories', value: 'Mirror, Soap dish, Towel rail - worth of ₹7,000 per 1000 sqft' },
          { label: 'Provision for Solar water heater', value: 'Included' },
        ],
      },
      {
        category: 'Doors & Windows',
        categoryOrder: 4,
        rows: [
          { label: 'Main Door', value: 'Teak door with teak frame of 5inch by 3.5 inch, worth ₹40,000 including fixtures' },
          { label: 'Internal Doors', value: 'Membrane / Flush door with laminates upto ₹13,000' },
          { label: 'Puja Room Door', value: 'Teak shutter with teak frame worth of ₹28,000 for every 2,000 sqft of package area' },
          { label: 'Windows', value: 'UPVC windows ₹700 per sqft of NCL Veka / Prominence / V-tech / Greentech' },
          { label: 'Window grills', value: 'Included' },
        ],
      },
      {
        category: 'Painting',
        categoryOrder: 5,
        rows: [
          { label: 'Interior Painting', value: 'Apcolite Premium Emulsion' },
          { label: 'Exterior Painting', value: 'Apex Exterior Emulsion' },
        ],
      },
      {
        category: 'Flooring',
        categoryOrder: 6,
        rows: [
          { label: 'Living & Dining Flooring', value: 'Tiles / Granite / Marble upto ₹140 per sqft' },
          { label: 'Rooms and Kitchen Flooring', value: 'Tiles upto ₹120 per sqft' },
          { label: 'Balcony and Open Area', value: 'Tiles upto ₹80 per sqft' },
          { label: 'Staircase', value: 'Upto ₹110 per sqft' },
          { label: 'Parking', value: 'Tiles upto ₹70 per sqft' },
        ],
      },
      {
        category: 'Wiring',
        categoryOrder: 7,
        rows: [
          { label: 'Fireproof Wiring', value: 'Finolex / Anchor / Havells' },
          { label: 'Switch', value: 'Legrand mylinic / Havells Coral / Roma' },
          { label: 'Socket', value: 'Legrand mylinic / Havells Coral / Roma' },
          { label: 'Provision for UPS Wiring', value: 'Included' },
        ],
      },
    ],
  },
  {
    name: 'Custom Build',
    pricePerSqFt: 0,
    tagline: 'Fully customised construction tailored to your vision. Work directly with our architects and engineers.',
    description: 'Fully customised construction tailored to your vision. Work directly with our architects and engineers.',
    status: 'active',
    priority: 4,
    isDefault: false,
    specs: [],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const count = await Package.countDocuments();
  if (count > 0) {
    console.log(`Package already has ${count} documents — skipping seed.`);
  } else {
    const created = await Package.insertMany(packages);
    console.log(`Seeded ${created.length} packages`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });

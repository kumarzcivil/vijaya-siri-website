import 'dotenv/config';
import mongoose from 'mongoose';
import Coupon from '../src/models/Coupon.js';

const COUPONS = [
  {
    code: 'WELCOME10',
    description: 'Get 10% off on your first Quick Fix service booking',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 200,
    minOrder: 500,
    serviceType: 'QUICK_FIX',
    usageLimit: 0,
    startDate: '',
    endDate: '',
    status: 'active',
  },
  {
    code: 'PRO500',
    description: '\u20B9500 flat off on Pro Fix services above \u20B91500',
    discountType: 'flat',
    discountValue: 500,
    maxDiscount: 0,
    minOrder: 1500,
    serviceType: 'PRO_FIX',
    usageLimit: 0,
    startDate: '',
    endDate: '',
    status: 'active',
  },
  {
    code: 'FIRSTFIX',
    description: '15% off on your first booking (any service)',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 300,
    minOrder: 1000,
    serviceType: 'BOTH',
    usageLimit: 0,
    startDate: '',
    endDate: '',
    status: 'active',
  },
  {
    code: 'FESTIVE20',
    description: 'Festival special: 20% off on all services',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 500,
    minOrder: 800,
    serviceType: 'BOTH',
    usageLimit: 500,
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    status: 'active',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vijayasiri');
    console.log('Connected to MongoDB');

    const force = process.argv.includes('--force');
    if (force) {
      await Coupon.deleteMany({});
      console.log('Cleared all coupons');
    }

    for (const data of COUPONS) {
      const existing = await Coupon.findOne({ code: data.code });
      if (existing && !force) {
        console.log(`Coupon ${data.code} exists, skipping`);
        continue;
      }
      if (existing && force) {
        await Coupon.findOneAndUpdate({ code: data.code }, { $set: data });
        console.log(`Updated coupon: ${data.code}`);
      } else {
        await Coupon.create(data);
        console.log(`Created coupon: ${data.code}`);
      }
    }

    const total = await Coupon.countDocuments();
    console.log(`\nSeeded ${COUPONS.length} coupons (${total} total in DB)`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();

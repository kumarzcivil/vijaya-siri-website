import mongoose from 'mongoose';

const marketingServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    icon: {
      type: String,
      default: 'building',
      trim: true,
    },
    ctaLabel: {
      type: String,
      default: 'Learn More',
      trim: true,
      maxlength: [50, 'CTA label cannot exceed 50 characters'],
    },
    ctaTarget: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'CTA target cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

marketingServiceSchema.index({ status: 1 });
marketingServiceSchema.index({ displayOrder: 1 });

const MarketingService = mongoose.model('MarketingService', marketingServiceSchema);
export default MarketingService;

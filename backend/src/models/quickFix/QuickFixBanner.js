import mongoose from 'mongoose';

const quickFixBannerSchema = new mongoose.Schema(
  {
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    internalName: {
      type: String,
      required: [true, 'Internal name is required'],
      trim: true,
      maxlength: [200, 'Internal name cannot exceed 200 characters'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
    },
    ctaLabel: {
      type: String,
      trim: true,
      maxlength: [50, 'CTA label cannot exceed 50 characters'],
      default: '',
    },
    destinationType: {
      type: String,
      enum: ['none', 'service', 'category', 'external'],
      default: 'none',
    },
    destination: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

quickFixBannerSchema.index({ displayOrder: 1 });
quickFixBannerSchema.index({ active: 1 });

const QuickFixBanner = mongoose.model('QuickFixBanner', quickFixBannerSchema);
export default QuickFixBanner;

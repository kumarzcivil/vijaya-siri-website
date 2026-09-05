import mongoose from 'mongoose';

const proFixBannerSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      trim: true,
      maxlength: [100, 'Eyebrow cannot exceed 100 characters'],
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    ctaLabel: {
      type: String,
      trim: true,
      maxlength: [50, 'CTA label cannot exceed 50 characters'],
      default: '',
    },
    ctaTarget: {
      type: String,
      trim: true,
      maxlength: [500, 'CTA target cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    isSeeded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

proFixBannerSchema.index({ priority: -1 });
proFixBannerSchema.index({ status: 1 });

const ProFixBanner = mongoose.model('ProFixBanner', proFixBannerSchema);
export default ProFixBanner;

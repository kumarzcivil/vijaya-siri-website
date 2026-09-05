import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    icon: {
      type: String,
      default: 'star',
    },
    image: {
      type: String,
      default: '',
    },
    ctaLabel: {
      type: String,
      trim: true,
      maxlength: [50, 'CTA label cannot exceed 50 characters'],
      default: 'Learn More',
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
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      trim: true,
      maxlength: [50, 'Badge cannot exceed 50 characters'],
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

offerSchema.index({ displayOrder: 1 });
offerSchema.index({ status: 1 });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;

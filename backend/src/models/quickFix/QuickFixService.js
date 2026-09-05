import mongoose from 'mongoose';

const quickFixServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    categoryId: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    includedItems: {
      type: [String],
      default: [],
    },
    notes: {
      type: [String],
      default: [],
    },
    pricing: {
      enabled: { type: Boolean, default: false },
      price: { type: Number, min: 0 },
      priceNote: { type: String, default: '' },
    },
    duration: {
      value: { type: Number, min: 0 },
      unit: { type: String, default: 'mins' },
    },
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    bookingConfiguration: {
      requiresTimeSlot: { type: Boolean, default: true },
      requiresPayment: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

quickFixServiceSchema.index({ displayOrder: 1 });
quickFixServiceSchema.index({ active: 1 });
quickFixServiceSchema.index({ categoryId: 1 });
quickFixServiceSchema.index({ featured: 1 });

const QuickFixService = mongoose.model('QuickFixService', quickFixServiceSchema);
export default QuickFixService;

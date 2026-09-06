import mongoose from 'mongoose';

const specRowSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const specCategorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    categoryOrder: { type: Number, default: 0 },
    rows: { type: [specRowSchema], default: [] },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    comparisonName: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Comparison name cannot exceed 100 characters'],
    },
    pricePerSqFt: {
      type: Number,
      required: [true, 'Price per sq.ft is required'],
      min: [0, 'Price cannot be negative'],
    },
    pricePrefix: {
      type: String,
      default: '\u20B9',
      trim: true,
    },
    priceUnit: {
      type: String,
      default: 'per sq.ft',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Tagline cannot exceed 300 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    features: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: 'home',
      trim: true,
    },
    popular: {
      type: Boolean,
      default: false,
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
    displayOrder: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    specs: {
      type: [specCategorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

packageSchema.index({ status: 1 });
packageSchema.index({ priority: 1 });
packageSchema.index({ displayOrder: 1 });

const Package = mongoose.model('Package', packageSchema);
export default Package;

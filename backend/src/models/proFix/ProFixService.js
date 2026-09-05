import mongoose from 'mongoose';

const proFixServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    startingPrice: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
    included: {
      type: [String],
      default: [],
    },
    notes: {
      type: [String],
      default: [],
    },
    pricing: {
      enabled: { type: Boolean, default: false },
      mode: {
        type: String,
        enum: ['custom', 'area_rate', 'quantity_rate', 'fixed'],
        default: 'custom',
      },
      rate: { type: Number, min: 0 },
      unit: { type: String, default: '' },
      quantityLabel: { type: String, default: '' },
      defaultQuantity: { type: Number, min: 0 },
      minQuantity: { type: Number, min: 0 },
      maxQuantity: { type: Number, min: 0 },
      step: { type: Number, min: 0 },
    },
    siteVisitCharge: {
      type: Number,
      default: 300,
      min: 0,
    },
    siteVisitWaiver: {
      enabled: { type: Boolean, default: true },
      label: { type: String, default: 'Work Completion Waiver' },
      amount: { type: Number, default: 300, min: 0 },
      trigger: { type: String, default: '' },
    },
    active: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

proFixServiceSchema.index({ displayOrder: 1 });
proFixServiceSchema.index({ active: 1 });
proFixServiceSchema.index({ category: 1 });

const ProFixService = mongoose.model('ProFixService', proFixServiceSchema);
export default ProFixService;

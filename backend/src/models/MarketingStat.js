import mongoose from 'mongoose';

const marketingStatSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: [true, 'Value is required'],
      trim: true,
      maxlength: [50, 'Value cannot exceed 50 characters'],
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
      maxlength: [100, 'Label cannot exceed 100 characters'],
    },
    icon: {
      type: String,
      default: 'home',
      trim: true,
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

marketingStatSchema.index({ status: 1 });
marketingStatSchema.index({ displayOrder: 1 });

const MarketingStat = mongoose.model('MarketingStat', marketingStatSchema);
export default MarketingStat;

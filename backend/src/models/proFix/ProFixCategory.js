import mongoose from 'mongoose';

const proFixCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Icon is required'],
      trim: true,
      enum: {
        values: [
          'bricks', 'diamond', 'building', 'leaf', 'wrench', 'store',
          'star', 'clipboard', 'check-circle', 'home', 'blueprint',
          'shield-check', 'map-pin', 'users', 'receipt', 'armchair',
        ],
        message: 'Invalid icon value',
      },
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

proFixCategorySchema.index({ displayOrder: 1 });
proFixCategorySchema.index({ active: 1 });

const ProFixCategory = mongoose.model('ProFixCategory', proFixCategorySchema);
export default ProFixCategory;

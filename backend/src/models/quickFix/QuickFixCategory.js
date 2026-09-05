import mongoose from 'mongoose';

const quickFixCategorySchema = new mongoose.Schema(
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
          'star', 'clipboard', 'wrench', 'armchair', 'leaf', 'shield-check',
          'diamond', 'home', 'blueprint', 'check-circle', 'map-pin', 'users',
          'receipt', 'building', 'store', 'phone',
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

quickFixCategorySchema.index({ displayOrder: 1 });
quickFixCategorySchema.index({ active: 1 });

const QuickFixCategory = mongoose.model('QuickFixCategory', quickFixCategorySchema);
export default QuickFixCategory;

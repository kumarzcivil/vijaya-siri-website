import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Project type is required'],
      trim: true,
      maxlength: [100, 'Type cannot exceed 100 characters'],
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true,
    },
    bedrooms: {
      type: String,
      required: [true, 'Bedrooms field is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'upcoming'],
      default: 'completed',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

projectSchema.index({ displayOrder: 1 });
projectSchema.index({ status: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;

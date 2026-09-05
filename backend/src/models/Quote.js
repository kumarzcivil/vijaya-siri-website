import mongoose from 'mongoose';

function generateRefId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VS-${ts}-${rand}`;
}

const quoteSchema = new mongoose.Schema(
  {
    refId: {
      type: String,
      unique: true,
      default: generateRefId,
      immutable: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
      match: [/^$|^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    projectDescription: {
      type: String,
      trim: true,
      maxlength: [2000, 'Project description cannot exceed 2000 characters'],
      default: '',
    },
    projectLocation: {
      type: String,
      required: [true, 'Project location is required'],
      enum: {
        values: ['siruguppa', 'adoni', 'sindhanur'],
        message: 'Location must be Siruguppa, Adoni, or Sindhanur',
      },
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required'],
      enum: {
        values: ['new-home', 'renovation', 'interior', 'commercial', 'civil-works'],
        message: 'Invalid project type',
      },
    },
    area: {
      type: Number,
      min: [10, 'Area must be at least 10 sq.ft'],
      max: [100000, 'Area cannot exceed 100,000 sq.ft'],
    },
    budget: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'closed'],
      default: 'new',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ projectLocation: 1 });

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote;

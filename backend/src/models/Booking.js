import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ['quick-fix', 'pro-fix'],
      required: [true, 'Booking kind is required'],
    },
    serviceId: {
      type: String,
      required: [true, 'Service ID is required'],
    },
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    categoryName: {
      type: String,
      default: '',
      trim: true,
    },
    slotDate: {
      type: String,
      default: '',
    },
    slotTime: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentRequired: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'submitted', 'paid', 'pay_after_service', 'none'],
      default: 'none',
    },
    paymentRef: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    couponCode: {
      type: String,
      default: '',
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerMobile: {
      type: String,
      required: [true, 'Customer mobile is required'],
      trim: true,
    },
    customerId: {
      type: String,
      default: '',
    },
    siteAddress: {
      type: String,
      default: '',
      trim: true,
    },
    siteLocation: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ customerMobile: 1 });
bookingSchema.index({ kind: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

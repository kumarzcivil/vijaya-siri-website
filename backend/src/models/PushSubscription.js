import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      default: '',
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint is required'],
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ customerId: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
export default PushSubscription;

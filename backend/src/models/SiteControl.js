import mongoose from 'mongoose';

const locationAvailabilitySchema = new mongoose.Schema(
  {
    quickFix: { type: Boolean, default: false },
    proFix: { type: Boolean, default: false },
  },
  { _id: false }
);

const siteControlSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    pages: {
      home: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      packages: { type: Boolean, default: true },
      proFix: { type: Boolean, default: true },
      quickFix: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      quote: { type: Boolean, default: true },
      account: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
    },
    locations: {
      type: Map,
      of: locationAvailabilitySchema,
      default: {
        siruguppa: { quickFix: true, proFix: true },
        adoni: { quickFix: false, proFix: false },
        sindhanur: { quickFix: false, proFix: false },
      },
    },
    quickFixLoginRequired: {
      type: Boolean,
      default: true,
    },
    proFixLoginRequired: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SiteControl = mongoose.model('SiteControl', siteControlSchema);
export default SiteControl;

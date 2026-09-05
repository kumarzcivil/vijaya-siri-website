import mongoose from 'mongoose';

const boqItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  unit: { type: String, default: 'Each' },
  quantity: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  specification: { type: String, default: '' },
  remarks: { type: String, default: '' },
}, { _id: false });

const scopeOfWorkSchema = new mongoose.Schema({
  includedWorks: { type: String, default: '' },
  excludedWorks: { type: String, default: '' },
  specifications: { type: String, default: '' },
}, { _id: false });

const paymentStageEntrySchema = new mongoose.Schema({
  type: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  value: { type: Number, default: 0 },
}, { _id: false });

const paymentStageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  entry: { type: paymentStageEntrySchema, default: () => ({}) },
}, { _id: false });

const advanceConfigSchema = new mongoose.Schema({
  kind: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  value: { type: Number, default: 0 },
}, { _id: false });

const paymentConfigSchema = new mongoose.Schema({
  mode: { type: String, enum: ['percentage', 'advance-balance', 'custom'], default: 'percentage' },
  stages: [paymentStageSchema],
  advance: { type: advanceConfigSchema, default: null },
}, { _id: false });

const estimateTermSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const addonEstimateRowSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  unit: { type: String, default: '' },
  rate: { type: Number, default: null },
  selected: { type: Boolean, default: false },
  quantityText: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  amount: { type: Number, default: null },
  isCustom: { type: Boolean, default: false },
}, { _id: false });

const milestoneRowSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  percent: { type: Number, default: 0 },
  description: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  status: { type: String, default: 'Upcoming' },
}, { _id: false });

const estimateLineSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  quantity: { type: Number, default: null },
  unit: { type: String, default: null },
  rate: { type: Number, default: null },
  amount: { type: Number, default: null },
}, { _id: false });

const estimateRowSchema = new mongoose.Schema({
  category: { type: String, default: '' },
  line: { type: estimateLineSchema, default: () => ({}) },
}, { _id: false });

const projectConfigurationSnapshotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  floorCount: { type: Number, default: 0 },
  floorKeys: [{ type: String }],
  isCustom: { type: Boolean, default: false },
}, { _id: false });

const projectPackageSnapshotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  rate: { type: Number, default: 0 },
  description: { type: String, default: '' },
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
}, { _id: false });

const estimateSchema = new mongoose.Schema({
  type: { type: String, enum: ['project', 'small-works'], required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  estimateNumber: { type: String, required: true },
  date: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },

  projectName: { type: String, default: '' },
  clientName: { type: String, default: '' },
  location: { type: String, default: '' },
  projectType: { type: String, default: '' },
  siteLocation: { type: String, default: '' },
  workTitle: { type: String, default: '' },
  workCategory: { type: String, default: '' },
  description: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },

  configuration: { type: projectConfigurationSnapshotSchema, default: null },
  isCustomConfiguration: { type: Boolean, default: false },
  customBuiltUpArea: { type: Number, default: 0 },
  customNumberOfFloors: { type: String, default: '' },
  customFloorLabel: { type: String, default: null },
  customOtherFloorCount: { type: Number, default: null },
  customBuildingFeatures: [{ type: String }],
  builtUpConfigured: { type: Boolean, default: true },
  configurationError: { type: String, default: null },

  selectedPackage: { type: projectPackageSnapshotSchema, default: null },
  plotArea: { type: Number, default: 0 },
  builtUpArea: { type: Number, default: 0 },
  perFloorBuiltUp: [{ type: Number }],
  ratePerSqft: { type: Number, default: 0 },
  estimateCost: { type: Number, default: 0 },

  addons: [addonEstimateRowSchema],
  addonTotal: { type: Number, default: 0 },
  projectTotal: { type: Number, default: 0 },

  milestones: [milestoneRowSchema],
  milestoneTotalPaid: { type: Number, default: 0 },

  boq: [boqItemSchema],
  scope: { type: scopeOfWorkSchema, default: null },
  payment: { type: paymentConfigSchema, default: null },
  terms: [estimateTermSchema],

  civilWorksRows: [estimateRowSchema],
  estimateRows: [estimateRowSchema],

  pricingSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  configSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },

  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EstimatorTemplate', default: null },
  templateName: { type: String, default: '' },

  notes: { type: String, default: '' },
}, { timestamps: true });

estimateSchema.index({ type: 1, customerId: 1, createdAt: -1 });
estimateSchema.index({ estimateNumber: 1 }, { unique: true });

const Estimate = mongoose.model('Estimate', estimateSchema);
export default Estimate;

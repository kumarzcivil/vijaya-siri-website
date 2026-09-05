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

const estimatorTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['small-works', 'project'], default: 'small-works' },
  active: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  defaultBoq: [boqItemSchema],
  defaultScope: { type: scopeOfWorkSchema, default: () => ({}) },
  defaultPayment: { type: paymentConfigSchema, default: () => ({}) },
  defaultTerms: [estimateTermSchema],
}, { timestamps: true });

estimatorTemplateSchema.index({ type: 1, active: 1, displayOrder: 1 });

const EstimatorTemplate = mongoose.model('EstimatorTemplate', estimatorTemplateSchema);
export default EstimatorTemplate;

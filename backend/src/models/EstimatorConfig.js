import mongoose from 'mongoose';

const constructionPackageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  description: { type: String, default: '' },
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  active: { type: Boolean, default: true },
}, { _id: false });

const buildingConfigurationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String, default: '' },
  floorCount: { type: Number, default: 0 },
  floorKeys: [{ type: String }],
  isCustom: { type: Boolean, default: false },
}, { _id: false });

const floorCountOptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false });

const buildingFeatureSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
}, { _id: false });

const milestoneDefSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  percent: { type: Number, required: true },
  description: { type: String, default: '' },
}, { _id: false });

const inclusionsSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [{ type: String }],
}, { _id: false });

const exclusionsSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  items: [{ type: String }],
}, { _id: false });

const optionalAddonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  rate: { type: Number, default: null },
  description: { type: String, default: '' },
}, { _id: false });

const rateConfigSchema = new mongoose.Schema({
  code: { type: String, required: true },
  label: { type: String, required: true },
  workKind: { type: String, required: true },
  unit: { type: String, required: true },
  amountPerUnit: { type: Number, required: true },
}, { _id: false });

const civilInputDefSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  symbol: { type: String, required: true },
}, { _id: false });

const civilWorkDefSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  category: { type: String, required: true },
  inputs: [civilInputDefSchema],
  unit: { type: String, required: true },
  formulaLabel: { type: String, required: true },
  formulaType: { type: String, required: true },
}, { _id: false });

const estimatorConfigSchema = new mongoose.Schema({
  constructionPackages: [constructionPackageSchema],
  buildingConfigurations: [buildingConfigurationSchema],
  floorCoverage: { type: Map, of: Number, default: {} },
  floorCountOptions: [floorCountOptionSchema],
  buildingFeatures: [buildingFeatureSchema],
  milestones: [milestoneDefSchema],
  inclusions: [inclusionsSectionSchema],
  exclusions: [exclusionsSectionSchema],
  optionalAddons: [optionalAddonSchema],
  pricing: {
    version: { type: Number, default: 1 },
    rates: [rateConfigSchema],
  },
  civilWorks: [civilWorkDefSchema],
  estimateCategories: [{ type: String }],
  units: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  constants: {
    maxPlotDimensionFt: { type: Number, default: 2000 },
    sqmToSqft: { type: Number, default: 10.7639104167 },
    cumToCft: { type: Number, default: 35.314666721489 },
    milestoneFloorPoolPercent: { type: Number, default: 40 },
  },
  textConstants: {
    scopeChangeNote: { type: String, default: '' },
    addonRateNotConfigured: { type: String, default: 'Rate not configured' },
    demoRatesNote: { type: String, default: '' },
  },
  smallWorksUnits: [{ type: String }],
  smallWorksCategories: [{ type: String }],
}, { timestamps: true });

const EstimatorConfig = mongoose.model('EstimatorConfig', estimatorConfigSchema);
export default EstimatorConfig;

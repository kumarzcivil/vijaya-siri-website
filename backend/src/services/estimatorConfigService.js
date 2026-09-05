import EstimatorConfig from '../models/EstimatorConfig.js';

const COLLECTION = 'estimatorconfigs';

function rawCol() {
  return EstimatorConfig.db.collection(COLLECTION);
}

const DEFAULT_CONFIG = {
  constructionPackages: [
    {
      id: 'standard', name: 'Standard', rate: 1800,
      description: 'Essential specification covering structural work, basic finishes and standard fittings.',
      inclusions: ['Structural + brickwork + plastering', 'Standard flooring and tiling', 'Standard electrical and plumbing points', 'Basic painting and finishing'],
      exclusions: ['Modular kitchen, wardrobes and furniture', 'False ceiling, solar, premium fixtures and external landscape works'],
      active: true,
    },
    {
      id: 'premium', name: 'Premium', rate: 1900,
      description: 'Improved finishes, better-grade fixtures and a wider specification scope.',
      inclusions: ['Everything in Standard', 'Better-grade flooring and tiles', 'Improved sanitary and electrical fixtures', 'Enhanced painting quality'],
      exclusions: ['Modular kitchen, wardrobes and furniture', 'False ceiling, solar, premium fixtures and external landscape works'],
      active: true,
    },
    {
      id: 'luxury', name: 'Luxury', rate: 2300,
      description: 'Premium-grade specification with higher-quality materials and finishes throughout.',
      inclusions: ['Everything in Premium', 'Premium flooring and tiling', 'Premium sanitary and electrical fixtures', 'Premium painting and finishing'],
      exclusions: ['Modular kitchen, wardrobes and furniture', 'False ceiling, solar, smart home and external landscape works'],
      active: true,
    },
  ],
  buildingConfigurations: [
    { id: 'g', label: 'G', description: 'Ground Floor', floorCount: 1, floorKeys: ['ground'], isCustom: false },
    { id: 'g-plus-1', label: 'G+1', description: 'Ground + First Floor', floorCount: 2, floorKeys: ['ground', 'first'], isCustom: false },
    { id: 'g-plus-2', label: 'G+2', description: 'Ground + First + Second Floor', floorCount: 3, floorKeys: ['ground', 'first', 'second'], isCustom: false },
    { id: 'g-plus-3', label: 'G+3', description: 'Ground + First + Second + Third Floor', floorCount: 4, floorKeys: ['ground', 'first', 'second', 'third'], isCustom: false },
    { id: 'g-plus-4', label: 'G+4', description: 'Ground + First + Second + Third + Fourth Floor', floorCount: 5, floorKeys: ['ground', 'first', 'second', 'third', 'fourth'], isCustom: false },
    { id: 'custom', label: 'Custom Built-up Area', description: 'Enter the total built-up area directly for this estimate', floorCount: 0, floorKeys: [], isCustom: true },
  ],
  floorCoverage: { ground: 0.875, first: 0.875, second: 0.75 },
  floorCountOptions: [
    { value: 'ground', label: 'Ground Floor' },
    { value: 'g1', label: 'G+1' },
    { value: 'g2', label: 'G+2' },
    { value: 'g3', label: 'G+3' },
    { value: 'g4', label: 'G+4' },
    { value: 'other', label: 'Other' },
  ],
  buildingFeatures: [
    { value: 'parking', label: 'Parking' },
    { value: 'balcony', label: 'Balcony' },
    { value: 'terrace', label: 'Terrace' },
    { value: 'staircase', label: 'Staircase' },
    { value: 'lift', label: 'Lift' },
    { value: 'utility', label: 'Utility / Service Area' },
    { value: 'pooja-room', label: 'Pooja Room' },
    { value: 'home-office', label: 'Home Office' },
    { value: 'store-room', label: 'Store Room' },
    { value: 'compound-wall', label: 'Compound Wall' },
  ],
  milestones: [
    { id: 'agreement', name: 'Agreement + Design + Mobilisation', percent: 5, description: 'Agreement formalities, design development and site mobilisation.' },
    { id: 'foundation', name: 'Foundation Completed', percent: 10, description: 'Excavation, PCC and foundation works completed.' },
    { id: 'plinth', name: 'Plinth Completed', percent: 8, description: 'Plinth beam and floor slab completed.' },
    { id: 'gr-rcc', name: 'Ground Floor RCC', percent: 12, description: 'Ground floor columns, beams and slabs cast.' },
    { id: 'gr-brick', name: 'Ground Floor Brickwork', percent: 8, description: 'Ground floor internal and external brickwork completed.' },
    { id: 'f1-rcc', name: 'First Floor RCC', percent: 12, description: 'First floor structural works cast.' },
    { id: 'f1-brick', name: 'First Floor Brickwork', percent: 8, description: 'First floor brickwork completed.' },
    { id: 'plaster', name: 'Plastering', percent: 10, description: 'Internal and external plastering completed.' },
    { id: 'services', name: 'Flooring + Electrical + Plumbing + Openings', percent: 10, description: 'Flooring, services and openings installed.' },
    { id: 'finishing', name: 'Painting + Fixtures + Finishing', percent: 10, description: 'Painting, fixtures and final finishing.' },
    { id: 'handover', name: 'Final Completion + Handover', percent: 7, description: 'Snagging, final completion and handover.' },
  ],
  inclusions: [
    { title: 'Civil & Structural', items: ['Excavation', 'PCC where applicable', 'Foundation', 'RCC columns', 'RCC beams', 'RCC slabs', 'Staircase', 'Reinforcement steel', 'Formwork/shuttering', 'Brick/block masonry', 'Internal plastering', 'External plastering'] },
    { title: 'Flooring & Tiling', items: ['Floor tiles according to package specification', 'Bathroom flooring', 'Bathroom wall tiles according to specification', 'Skirting', 'Kitchen dado according to specification'] },
    { title: 'Doors & Windows', items: ['Main door according to specification', 'Internal doors', 'Bathroom doors', 'Windows', 'Frames', 'Standard hardware'] },
    { title: 'Electrical', items: ['Concealed conduits', 'Wiring', 'Switch boxes', 'Standard switches/sockets', 'Distribution board', 'MCB/RCCB provision', 'Earthing', 'Standard electrical points'] },
    { title: 'Plumbing', items: ['Water-supply piping', 'Drainage piping', 'Soil/waste piping', 'Bathroom plumbing points', 'Kitchen plumbing points'] },
    { title: 'Sanitary', items: ['WC', 'Wash basin', 'Standard taps', 'Shower points', 'Basic bathroom fittings'] },
    { title: 'Painting', items: ['Surface preparation', 'Putty where specified', 'Primer', 'Interior paint', 'Exterior paint', 'Ceiling paint'] },
  ],
  exclusions: [
    { title: 'Land & Legal', items: ['Land purchase', 'Registration', 'Stamp duty', 'Legal fees', 'Property documentation charges'] },
    { title: 'Government / Approval', items: ['Building approval fees', 'Municipal/local authority charges', 'Development charges', 'Statutory fees', 'Government charges/taxes where applicable'] },
    { title: 'Site-Specific', items: ['Rock excavation', 'Hard-rock breaking', 'Piling', 'Special foundation systems', 'Dewatering', 'Major soil treatment', 'Retaining walls unless specifically included'] },
    { title: 'External Works', items: ['Compound wall unless specified', 'Main gate unless specified', 'Landscaping', 'Garden work', 'Major driveway/paving', 'Decorative external works'] },
    { title: 'Utility Connections', items: ['Electricity connection/meter charges', 'Water connection charges', 'Borewell', 'Borewell equipment', 'Water tanker charges', 'Sewage connection charges', 'Utility deposits'] },
    { title: 'Appliances', items: ['AC', 'Geyser', 'Refrigerator', 'Washing machine', 'TV', 'Water purifier', 'Kitchen appliances', 'Solar systems unless specified'] },
    { title: 'Custom / Premium Items', items: ['Modular kitchen', 'Wardrobes', 'Furniture', 'False ceiling unless specified', 'Decorative wall panels', 'Premium lighting', 'Smart-home systems', 'CCTV/security systems', 'Premium sanitary/electrical fixtures'] },
  ],
  optionalAddons: [
    { id: 'modular-kitchen', name: 'Modular kitchen', unit: 'set', rate: null, description: '' },
    { id: 'wardrobes', name: 'Wardrobes', unit: 'set', rate: null, description: '' },
    { id: 'false-ceiling', name: 'False ceiling', unit: 'sq ft', rate: null, description: '' },
    { id: 'compound-wall', name: 'Compound wall', unit: 'r.ft', rate: null, description: '' },
    { id: 'main-gate', name: 'Main gate', unit: 'set', rate: null, description: '' },
    { id: 'solar-water-heater', name: 'Solar water heater', unit: 'nos', rate: null, description: '' },
    { id: 'solar-power', name: 'Solar power', unit: 'kW', rate: null, description: '' },
    { id: 'cctv', name: 'CCTV', unit: 'nos', rate: null, description: '' },
    { id: 'smart-home', name: 'Smart home', unit: 'set', rate: null, description: '' },
    { id: 'premium-sanitary', name: 'Premium sanitary', unit: 'set', rate: null, description: '' },
    { id: 'premium-electrical', name: 'Premium electrical fixtures', unit: 'set', rate: null, description: '' },
    { id: 'landscaping', name: 'Landscaping', unit: 'lot', rate: null, description: '' },
  ],
  pricing: { version: 1, rates: [] },
  civilWorks: [
    { key: 'concrete', label: 'Concrete', category: 'RCC / Structural Works', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'width', label: 'Width', symbol: 'W' }, { key: 'depth', label: 'Depth / Thickness', symbol: 'D' }], unit: 'cum', formulaLabel: 'Length × Width × Depth / Thickness = Volume', formulaType: 'volume' },
    { key: 'rcc', label: 'RCC (Reinforced Cement Concrete)', category: 'RCC / Structural Works', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'width', label: 'Width', symbol: 'W' }, { key: 'depth', label: 'Depth / Thickness', symbol: 'D' }], unit: 'cum', formulaLabel: 'Length × Width × Depth / Thickness = Volume', formulaType: 'volume' },
    { key: 'pcc', label: 'PCC (Plain Cement Concrete)', category: 'Foundation', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'width', label: 'Width', symbol: 'W' }, { key: 'depth', label: 'Depth / Thickness', symbol: 'D' }], unit: 'cum', formulaLabel: 'Length × Width × Depth / Thickness = Volume', formulaType: 'volume' },
    { key: 'brickwork', label: 'Brickwork', category: 'Brick / Block Work', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'height', label: 'Height', symbol: 'H' }, { key: 'depth', label: 'Depth / Thickness', symbol: 'D' }], unit: 'cum', formulaLabel: 'Length × Height × Thickness = Volume', formulaType: 'wallVolume' },
    { key: 'blockwork', label: 'Blockwork', category: 'Brick / Block Work', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'height', label: 'Height', symbol: 'H' }, { key: 'depth', label: 'Depth / Thickness', symbol: 'D' }], unit: 'cum', formulaLabel: 'Length × Height × Thickness = Volume', formulaType: 'wallVolume' },
    { key: 'plastering', label: 'Plastering', category: 'Plastering', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'height', label: 'Height', symbol: 'H' }], unit: 'sqm', formulaLabel: 'Length × Height = Surface Area', formulaType: 'plasterArea' },
    { key: 'flooring', label: 'Flooring', category: 'Flooring', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'width', label: 'Width', symbol: 'W' }], unit: 'sqm', formulaLabel: 'Length × Width = Floor Area', formulaType: 'area' },
    { key: 'excavation', label: 'Excavation', category: 'Site / Preliminary Works', inputs: [{ key: 'length', label: 'Length', symbol: 'L' }, { key: 'width', label: 'Width', symbol: 'W' }, { key: 'depth', label: 'Depth', symbol: 'D' }], unit: 'cum', formulaLabel: 'Length × Width × Depth = Volume', formulaType: 'volume' },
  ],
  estimateCategories: ['Site / Preliminary Works', 'Foundation', 'RCC / Structural Works', 'Brick / Block Work', 'Plastering', 'Flooring', 'Doors & Windows', 'Electrical', 'Plumbing', 'Painting', 'Other Civil Works'],
  units: {
    sqft: { unit: 'sqft', label: 'Square Feet', shortLabel: 'sq.ft' },
    sqm: { unit: 'sqm', label: 'Square Metre', shortLabel: 'sq.m' },
    cft: { unit: 'cft', label: 'Cubic Feet', shortLabel: 'cu.ft' },
    cum: { unit: 'cum', label: 'Cubic Metre', shortLabel: 'cu.m' },
    rm: { unit: 'rm', label: 'Running Metre', shortLabel: 'r.m' },
    nos: { unit: 'nos', label: 'Number', shortLabel: 'nos' },
  },
  constants: {
    maxPlotDimensionFt: 2000,
    sqmToSqft: 10.7639104167,
    cumToCft: 35.314666721489,
    milestoneFloorPoolPercent: 40,
  },
  textConstants: {
    scopeChangeNote: 'Any customer-requested work outside the approved scope must be treated as a Change Request and separately priced and approved before execution.',
    addonRateNotConfigured: 'Rate not configured',
    demoRatesNote: 'Package rates shown here are DEMO values for this preview and are not verified commercial rates.',
  },
  smallWorksUnits: ['Sq.ft', 'Sq.m', 'R.ft', 'Nos', 'Each', 'Kg', 'Ltr', 'Cu.ft', 'Cu.m', 'Hour', 'Day', 'LS', 'Other'],
  smallWorksCategories: ['Civil Works', 'Repair & Renovation', 'Flooring', 'Painting', 'Plumbing', 'Electrical', 'Waterproofing', 'Compound Wall', 'General Small Works'],
};

async function ensureDocument() {
  const count = await rawCol().countDocuments();
  if (count === 0) {
    await rawCol().insertOne({
      ...DEFAULT_CONFIG,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

async function getConfig() {
  await ensureDocument();
  return rawCol().findOne({});
}

async function updateConfig(updates) {
  await ensureDocument();
  await rawCol().updateOne({}, { $set: { ...updates, updatedAt: new Date() } });
  return getConfig();
}

async function updatePackages(packages) {
  return updateConfig({ constructionPackages: packages });
}

async function updateFloorCoverage(coverage) {
  return updateConfig({ floorCoverage: coverage });
}

async function updateMilestones(milestones) {
  return updateConfig({ milestones });
}

async function updateOptionalAddons(addons) {
  return updateConfig({ optionalAddons: addons });
}

async function updatePricing(pricing) {
  return updateConfig({ pricing });
}

async function updateInclusions(inclusions) {
  return updateConfig({ inclusions });
}

async function updateExclusions(exclusions) {
  return updateConfig({ exclusions });
}

async function resetConfig() {
  await ensureDocument();
  await rawCol().updateOne({}, { $set: { ...DEFAULT_CONFIG, updatedAt: new Date() } });
  return getConfig();
}

export {
  getConfig,
  updateConfig,
  updatePackages,
  updateFloorCoverage,
  updateMilestones,
  updateOptionalAddons,
  updatePricing,
  updateInclusions,
  updateExclusions,
  resetConfig,
  DEFAULT_CONFIG,
};

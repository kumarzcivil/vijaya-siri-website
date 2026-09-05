import "dotenv/config";
import connectDB from "../src/config/db.js";
import EstimatorConfig from "../src/models/EstimatorConfig.js";
import EstimatorTemplate from "../src/models/EstimatorTemplate.js";

const SMALL_WORKS_TEMPLATES = [
  {
    name: 'Civil Repair',
    category: 'Repair & Renovation',
    description: 'Structural and masonry repair works on existing structures.',
    type: 'small-works',
    active: true,
    displayOrder: 1,
    defaultBoq: [
      { id: 'c1', description: 'Crack repair and sealing', category: '', unit: 'R.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'c2', description: 'Plaster repair', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'c3', description: 'RCC repair and treatment', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Crack sealing, plaster repair and surface treatment.',
      excludedWorks: 'Major structural demolition, concealed services replacement.',
      specifications: 'Repair materials to be assessed on site.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'Bathroom Renovation',
    category: 'Repair & Renovation',
    description: 'Full bathroom demolition, waterproofing, tiling and fixture fit-out.',
    type: 'small-works',
    active: true,
    displayOrder: 2,
    defaultBoq: [
      { id: 'b1', description: 'Floor tile removal', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'b2', description: 'Floor tile supply', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'b3', description: 'Tile laying', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'b4', description: 'Grouting and finishing', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Existing tile removal, surface preparation, tile installation and grouting.',
      excludedWorks: 'Structural repairs and concealed plumbing replacement.',
      specifications: 'Tiles and fittings as per selected range.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [
        { id: 'p1', name: 'Advance on Confirmation', description: '', entry: { type: 'percent', value: 30 } },
        { id: 'p2', name: 'Material Procurement', description: '', entry: { type: 'percent', value: 35 } },
        { id: 'p3', name: 'Work Progress', description: '', entry: { type: 'percent', value: 25 } },
        { id: 'p4', name: 'Completion & Handover', description: '', entry: { type: 'percent', value: 10 } },
      ],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'Flooring Work',
    category: 'Flooring',
    description: 'Supply and laying of flooring over prepared surfaces.',
    type: 'small-works',
    active: true,
    displayOrder: 3,
    defaultBoq: [
      { id: 'f1', description: 'Flooring material supply', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'f2', description: 'Flooring laying', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'f3', description: 'Skirting work', category: '', unit: 'R.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Supply and laying of flooring, skirting and finishing.',
      excludedWorks: 'Old flooring removal and base preparation unless specified.',
      specifications: 'Flooring material as per selected range.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'Painting Work',
    category: 'Painting',
    description: 'Interior and exterior painting including surface preparation.',
    type: 'small-works',
    active: true,
    displayOrder: 4,
    defaultBoq: [
      { id: 'p1', description: 'Surface preparation', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'p2', description: 'Primer coat', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'p3', description: 'Paint application', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Surface preparation, priming and paint application.',
      excludedWorks: 'Major plaster repairs and waterproofing unless specified.',
      specifications: 'Paint as per selected brand and shade.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'Plumbing Work',
    category: 'Plumbing',
    description: 'Water supply, drainage and sanitary plumbing works.',
    type: 'small-works',
    active: true,
    displayOrder: 5,
    defaultBoq: [
      { id: 'pl1', description: 'Supply of pipes and fittings', category: '', unit: 'Each', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'pl2', description: 'Water supply piping', category: '', unit: 'R.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'pl3', description: 'Sanitary fittings installation', category: '', unit: 'Each', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Supply and installation of plumbing and sanitary fittings.',
      excludedWorks: 'Major structural cutting and external service connections.',
      specifications: 'Fittings as per selected range.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'Electrical Work',
    category: 'Electrical',
    description: 'Wiring, points, switchboards and light fittings.',
    type: 'small-works',
    active: true,
    displayOrder: 6,
    defaultBoq: [
      { id: 'e1', description: 'Wiring', category: '', unit: 'R.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'e2', description: 'Switch points', category: '', unit: 'Nos', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'e3', description: 'Light fittings supply & fixing', category: '', unit: 'Each', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Concealed wiring, points and fitting installation.',
      excludedWorks: 'External service connection charges.',
      specifications: 'Material as per selected range.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'Compound Wall',
    category: 'Compound Wall',
    description: 'Compound wall construction including masonry and plastering.',
    type: 'small-works',
    active: true,
    displayOrder: 7,
    defaultBoq: [
      { id: 'cw1', description: 'Foundation and footing', category: '', unit: 'R.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'cw2', description: 'Wall masonry', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'cw3', description: 'Plastering and finishing', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Foundation, masonry, plastering and finishing of the compound wall.',
      excludedWorks: 'Main gate, painting and external landscaping unless specified.',
      specifications: 'Wall design and height as per approved layout.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'Waterproofing',
    category: 'Waterproofing',
    description: 'Waterproofing of roofs, terraces, bathrooms and walls.',
    type: 'small-works',
    active: true,
    displayOrder: 8,
    defaultBoq: [
      { id: 'w1', description: 'Surface preparation', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'w2', description: 'Waterproofing membrane / chemical', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'w3', description: 'Protective screed', category: '', unit: 'Sq.ft', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'Surface preparation, waterproofing application and protective screed.',
      excludedWorks: 'Structural repair and internal finishes unless specified.',
      specifications: 'Waterproofing system as per manufacturer recommendations.',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
  {
    name: 'General Small Works',
    category: 'General Small Works',
    description: 'General repair, maintenance and small construction works.',
    type: 'small-works',
    active: true,
    displayOrder: 9,
    defaultBoq: [
      { id: 'g1', description: 'Description of work', category: '', unit: 'Each', quantity: 0, rate: 0, specification: '', remarks: '' },
      { id: 'g2', description: 'Description of work', category: '', unit: 'Each', quantity: 0, rate: 0, specification: '', remarks: '' },
    ],
    defaultScope: {
      includedWorks: 'As described in the BOQ.',
      excludedWorks: 'Work not listed in the BOQ or scope.',
      specifications: '',
    },
    defaultPayment: {
      mode: 'percentage',
      stages: [{ id: 'advance', name: 'Advance on Confirmation', description: 'Advance payable on confirmation of work.', entry: { type: 'percent', value: 30 } }],
      advance: null,
    },
    defaultTerms: [
      { id: 'validity', title: 'Estimate validity', description: 'This estimate is valid for 30 days from the date of issue.' },
      { id: 'commencement', title: 'Commencement', description: 'Work commencement is subject to confirmation and the applicable advance payment.' },
      { id: 'extra-work', title: 'Additional work', description: 'Any work outside the approved BOQ will require separate written approval and pricing.' },
      { id: 'spec-availability', title: 'Specifications', description: 'Material specifications may be subject to availability; equivalent alternatives may be proposed.' },
      { id: 'site-conditions', title: 'Site conditions', description: 'Unforeseen site conditions are excluded unless specifically included in the scope.' },
      { id: 'measurement', title: 'Quantities', description: 'Final quantities may vary based on actual site measurement where applicable.' },
    ],
  },
];

const ESTIMATOR_CONFIG = {
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

async function seed() {
  await connectDB();

  console.log('Seeding EstimatorConfig...');
  const existingConfig = await EstimatorConfig.findOne();
  if (existingConfig) {
    await EstimatorConfig.updateOne({}, { $set: { ...ESTIMATOR_CONFIG, updatedAt: new Date() } });
    console.log('  Updated existing EstimatorConfig');
  } else {
    await EstimatorConfig.create({ ...ESTIMATOR_CONFIG, createdAt: new Date(), updatedAt: new Date() });
    console.log('  Created new EstimatorConfig');
  }

  console.log('Seeding EstimatorTemplates...');
  const existingTemplates = await EstimatorTemplate.countDocuments();
  if (existingTemplates > 0) {
    console.log(`  ${existingTemplates} templates already exist, skipping seed`);
  } else {
    for (const tmpl of SMALL_WORKS_TEMPLATES) {
      await EstimatorTemplate.create({ ...tmpl, createdAt: new Date(), updatedAt: new Date() });
      console.log(`  Created template: ${tmpl.name}`);
    }
  }

  console.log('\nVerifying seed data...');
  const config = await EstimatorConfig.findOne();
  console.log(`  Config: ${config.constructionPackages.length} packages, ${config.buildingConfigurations.length} configurations, ${config.milestones.length} milestones`);
  console.log(`  Config: ${config.inclusions.length} inclusions sections, ${config.exclusions.length} exclusions sections`);
  console.log(`  Config: ${config.optionalAddons.length} addons, ${config.civilWorks.length} civil works`);
  console.log(`  Config: ${config.estimateCategories.length} estimate categories`);

  const templates = await EstimatorTemplate.find();
  console.log(`  Templates: ${templates.length} total`);
  for (const t of templates) {
    console.log(`    - ${t.name} (${t.category}): ${t.defaultBoq.length} BOQ items, ${t.defaultTerms.length} terms`);
  }

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

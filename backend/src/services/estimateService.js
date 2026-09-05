import Estimate from '../models/Estimate.js';

const COLLECTION = 'estimates';

function rawCol() {
  return Estimate.db.collection(COLLECTION);
}

async function createEstimate(data) {
  const doc = {
    type: data.type || 'project',
    customerId: data.customerId || null,
    estimateNumber: data.estimateNumber,
    date: data.date || new Date().toISOString().slice(0, 10),
    status: data.status || 'draft',

    projectName: data.projectName || '',
    clientName: data.clientName || '',
    location: data.location || '',
    projectType: data.projectType || '',
    siteLocation: data.siteLocation || '',
    workTitle: data.workTitle || '',
    workCategory: data.workCategory || '',
    description: data.description || '',
    mobileNumber: data.mobileNumber || '',

    configuration: data.configuration || null,
    isCustomConfiguration: data.isCustomConfiguration || false,
    customBuiltUpArea: data.customBuiltUpArea || 0,
    customNumberOfFloors: data.customNumberOfFloors || '',
    customFloorLabel: data.customFloorLabel || null,
    customOtherFloorCount: data.customOtherFloorCount || null,
    customBuildingFeatures: data.customBuildingFeatures || [],
    builtUpConfigured: data.builtUpConfigured !== undefined ? data.builtUpConfigured : true,
    configurationError: data.configurationError || null,

    selectedPackage: data.selectedPackage || null,
    plotArea: data.plotArea || 0,
    builtUpArea: data.builtUpArea || 0,
    perFloorBuiltUp: data.perFloorBuiltUp || [],
    ratePerSqft: data.ratePerSqft || 0,
    estimateCost: data.estimateCost || 0,

    addons: data.addons || [],
    addonTotal: data.addonTotal || 0,
    projectTotal: data.projectTotal || 0,

    milestones: data.milestones || [],
    milestoneTotalPaid: data.milestoneTotalPaid || 0,

    boq: data.boq || [],
    scope: data.scope || null,
    payment: data.payment || null,
    terms: data.terms || [],

    civilWorksRows: data.civilWorksRows || [],
    estimateRows: data.estimateRows || [],

    pricingSnapshot: data.pricingSnapshot || null,
    configSnapshot: data.configSnapshot || null,

    subtotal: data.subtotal || 0,
    discount: data.discount || 0,
    tax: data.tax || 0,
    total: data.total || 0,

    templateId: data.templateId || null,
    templateName: data.templateName || '',

    notes: data.notes || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await rawCol().insertOne(doc);
  return rawCol().findOne({ _id: result.insertedId });
}

async function getEstimateById(id) {
  return rawCol().findOne({ _id: id });
}

async function getEstimateByNumber(estimateNumber) {
  return rawCol().findOne({ estimateNumber });
}

async function getEstimates(filter = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const query = { ...filter };
  const [items, total] = await Promise.all([
    rawCol().find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    rawCol().countDocuments(query),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

async function updateEstimate(id, data) {
  const update = { updatedAt: new Date() };
  const allowedFields = [
    'status', 'projectName', 'clientName', 'location', 'projectType',
    'siteLocation', 'workTitle', 'workCategory', 'description', 'mobileNumber',
    'addons', 'addonTotal', 'projectTotal', 'milestones', 'milestoneTotalPaid',
    'boq', 'scope', 'payment', 'terms', 'civilWorksRows', 'estimateRows',
    'subtotal', 'discount', 'tax', 'total', 'notes',
  ];
  for (const field of allowedFields) {
    if (data[field] !== undefined) update[field] = data[field];
  }
  await rawCol().updateOne({ _id: id }, { $set: update });
  return rawCol().findOne({ _id: id });
}

async function deleteEstimate(id) {
  return rawCol().deleteOne({ _id: id });
}

export {
  createEstimate,
  getEstimateById,
  getEstimateByNumber,
  getEstimates,
  updateEstimate,
  deleteEstimate,
};

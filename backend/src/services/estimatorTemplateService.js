import EstimatorTemplate from '../models/EstimatorTemplate.js';

const COLLECTION = 'estimatortemplates';

function rawCol() {
  return EstimatorTemplate.db.collection(COLLECTION);
}

async function getAllTemplates(filter = {}) {
  const query = { ...filter };
  return rawCol().find(query).sort({ displayOrder: 1, createdAt: 1 }).toArray();
}

async function getTemplateById(id) {
  return rawCol().findOne({ _id: id });
}

async function getTemplateByObjectId(objectId) {
  return rawCol().findOne({ _id: objectId });
}

async function createTemplate(data) {
  const maxOrder = await rawCol().findOne({}, { sort: { displayOrder: -1 } });
  const doc = {
    name: data.name,
    category: data.category || '',
    description: data.description || '',
    type: data.type || 'small-works',
    active: data.active !== undefined ? data.active : true,
    displayOrder: (maxOrder?.displayOrder || 0) + 1,
    defaultBoq: data.defaultBoq || [],
    defaultScope: data.defaultScope || { includedWorks: '', excludedWorks: '', specifications: '' },
    defaultPayment: data.defaultPayment || { mode: 'percentage', stages: [], advance: null },
    defaultTerms: data.defaultTerms || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await rawCol().insertOne(doc);
  return rawCol().findOne({ _id: result.insertedId });
}

async function updateTemplate(id, data) {
  const update = { updatedAt: new Date() };
  if (data.name !== undefined) update.name = data.name;
  if (data.category !== undefined) update.category = data.category;
  if (data.description !== undefined) update.description = data.description;
  if (data.type !== undefined) update.type = data.type;
  if (data.active !== undefined) update.active = data.active;
  if (data.displayOrder !== undefined) update.displayOrder = data.displayOrder;
  if (data.defaultBoq !== undefined) update.defaultBoq = data.defaultBoq;
  if (data.defaultScope !== undefined) update.defaultScope = data.defaultScope;
  if (data.defaultPayment !== undefined) update.defaultPayment = data.defaultPayment;
  if (data.defaultTerms !== undefined) update.defaultTerms = data.defaultTerms;

  await rawCol().updateOne({ _id: id }, { $set: update });
  return rawCol().findOne({ _id: id });
}

async function deleteTemplate(id) {
  return rawCol().deleteOne({ _id: id });
}

async function toggleActive(id) {
  const doc = await rawCol().findOne({ _id: id });
  if (!doc) return null;
  const newActive = !doc.active;
  await rawCol().updateOne({ _id: id }, { $set: { active: newActive, updatedAt: new Date() } });
  return rawCol().findOne({ _id: id });
}

async function moveTemplate(id, direction) {
  const doc = await rawCol().findOne({ _id: id });
  if (!doc) return null;

  const neighbor = direction === 'up'
    ? await rawCol().findOne({ displayOrder: { $lt: doc.displayOrder } }, { sort: { displayOrder: -1 } })
    : await rawCol().findOne({ displayOrder: { $gt: doc.displayOrder } }, { sort: { displayOrder: 1 } });

  if (!neighbor) return doc;

  const tempOrder = doc.displayOrder;
  await rawCol().updateOne({ _id: id }, { $set: { displayOrder: neighbor.displayOrder, updatedAt: new Date() } });
  await rawCol().updateOne({ _id: neighbor._id }, { $set: { displayOrder: tempOrder, updatedAt: new Date() } });

  return rawCol().findOne({ _id: id });
}

export {
  getAllTemplates,
  getTemplateById,
  getTemplateByObjectId,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleActive,
  moveTemplate,
};

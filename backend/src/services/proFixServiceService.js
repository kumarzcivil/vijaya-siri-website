import ProFixService from '../models/proFix/ProFixService.js';

class ProFixServiceService {
  async list(query = {}) {
    const filter = {};
    if (query.active !== undefined) filter.active = query.active === 'true';
    if (query.category) filter.category = query.category;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }
    return ProFixService.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return ProFixService.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await ProFixService.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const service = new ProFixService({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return service.save();
  }

  async update(id, data) {
    return ProFixService.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleActive(id) {
    const service = await ProFixService.findById(id);
    if (!service) return null;
    service.active = !service.active;
    return service.save();
  }

  async delete(id) {
    return ProFixService.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await ProFixService.bulkWrite(ops);
  }

  async getStats() {
    const [total, active] = await Promise.all([
      ProFixService.countDocuments(),
      ProFixService.countDocuments({ active: true }),
    ]);
    return { total, active, inactive: total - active };
  }
}

export default new ProFixServiceService();

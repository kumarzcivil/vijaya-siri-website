import QuickFixService from '../models/quickFix/QuickFixService.js';

class QuickFixServiceService {
  async list(query = {}) {
    const filter = {};
    if (query.active !== undefined) filter.active = query.active === 'true';
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.featured !== undefined) filter.featured = query.featured === 'true';
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }
    return QuickFixService.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return QuickFixService.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await QuickFixService.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const service = new QuickFixService({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return service.save();
  }

  async update(id, data) {
    return QuickFixService.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleActive(id) {
    const service = await QuickFixService.findById(id);
    if (!service) return null;
    service.active = !service.active;
    return service.save();
  }

  async delete(id) {
    return QuickFixService.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await QuickFixService.bulkWrite(ops);
  }

  async getStats() {
    const [total, active, featured] = await Promise.all([
      QuickFixService.countDocuments(),
      QuickFixService.countDocuments({ active: true }),
      QuickFixService.countDocuments({ featured: true }),
    ]);
    return { total, active, inactive: total - active, featured };
  }
}

export default new QuickFixServiceService();

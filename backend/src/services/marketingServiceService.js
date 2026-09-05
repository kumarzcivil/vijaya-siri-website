import MarketingService from '../models/MarketingService.js';

class MarketingServiceService {
  async list(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    return MarketingService.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return MarketingService.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await MarketingService.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const service = new MarketingService({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return service.save();
  }

  async update(id, data) {
    return MarketingService.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleStatus(id) {
    const service = await MarketingService.findById(id);
    if (!service) return null;
    service.status = service.status === 'active' ? 'inactive' : 'active';
    return service.save();
  }

  async delete(id) {
    return MarketingService.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await MarketingService.bulkWrite(ops);
  }

  async getStats() {
    const total = await MarketingService.countDocuments();
    const active = await MarketingService.countDocuments({ status: 'active' });
    const inactive = await MarketingService.countDocuments({ status: 'inactive' });
    return { total, active, inactive };
  }
}

export default new MarketingServiceService();

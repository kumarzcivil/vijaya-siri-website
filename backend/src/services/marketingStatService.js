import MarketingStat from '../models/MarketingStat.js';

class MarketingStatService {
  async list(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    return MarketingStat.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return MarketingStat.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await MarketingStat.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const stat = new MarketingStat({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return stat.save();
  }

  async update(id, data) {
    return MarketingStat.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleStatus(id) {
    const stat = await MarketingStat.findById(id);
    if (!stat) return null;
    stat.status = stat.status === 'active' ? 'inactive' : 'active';
    return stat.save();
  }

  async delete(id) {
    return MarketingStat.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await MarketingStat.bulkWrite(ops);
  }
}

export default new MarketingStatService();

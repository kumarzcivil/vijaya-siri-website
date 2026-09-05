import QuickFixBanner from '../models/quickFix/QuickFixBanner.js';

class QuickFixBannerService {
  async list(query = {}) {
    const filter = {};
    if (query.active !== undefined) filter.active = query.active === 'true';
    if (query.search) {
      filter.$or = [
        { internalName: { $regex: query.search, $options: 'i' } },
        { ctaLabel: { $regex: query.search, $options: 'i' } },
      ];
    }
    return QuickFixBanner.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return QuickFixBanner.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await QuickFixBanner.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const banner = new QuickFixBanner({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return banner.save();
  }

  async update(id, data) {
    return QuickFixBanner.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleActive(id) {
    const banner = await QuickFixBanner.findById(id);
    if (!banner) return null;
    banner.active = !banner.active;
    return banner.save();
  }

  async delete(id) {
    return QuickFixBanner.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await QuickFixBanner.bulkWrite(ops);
  }

  async getStats() {
    const [total, active] = await Promise.all([
      QuickFixBanner.countDocuments(),
      QuickFixBanner.countDocuments({ active: true }),
    ]);
    return { total, active, inactive: total - active };
  }
}

export default new QuickFixBannerService();

import ProFixBanner from '../models/proFix/ProFixBanner.js';

class ProFixBannerService {
  async list(query = {}) {
    const filter = {};
    if (query.active !== undefined) filter.active = query.active === 'true';
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { eyebrow: { $regex: query.search, $options: 'i' } },
      ];
    }
    return ProFixBanner.find(filter).sort({ priority: -1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return ProFixBanner.findById(id).lean();
  }

  async create(data) {
    const banner = new ProFixBanner(data);
    return banner.save();
  }

  async update(id, data) {
    return ProFixBanner.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleStatus(id) {
    const banner = await ProFixBanner.findById(id);
    if (!banner) return null;
    banner.status = banner.status === 'active' ? 'inactive' : 'active';
    return banner.save();
  }

  async delete(id) {
    return ProFixBanner.findByIdAndDelete(id).lean();
  }

  async getStats() {
    const [total, active] = await Promise.all([
      ProFixBanner.countDocuments(),
      ProFixBanner.countDocuments({ active: true }),
    ]);
    return { total, active, inactive: total - active };
  }
}

export default new ProFixBannerService();

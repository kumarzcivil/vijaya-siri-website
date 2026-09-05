import Package from '../models/Package.js';

class PackageService {
  async list(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    return Package.find(filter).sort({ priority: 1, createdAt: 1 }).lean();
  }

  async getActive() {
    return Package.find({ status: 'active' }).sort({ priority: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return Package.findById(id).lean();
  }

  async create(data) {
    const pkg = new Package(data);
    return pkg.save();
  }

  async update(id, data) {
    return Package.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async delete(id) {
    return Package.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { priority: i + 1 } } },
    }));
    if (ops.length) await Package.bulkWrite(ops);
  }

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      Package.countDocuments(),
      Package.countDocuments({ status: 'active' }),
      Package.countDocuments({ status: 'inactive' }),
    ]);
    return { total, active, inactive };
  }
}

export default new PackageService();

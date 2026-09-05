import ProFixCategory from '../models/proFix/ProFixCategory.js';
import ProFixService from '../models/proFix/ProFixService.js';

class ProFixCategoryService {
  async list(query = {}) {
    const filter = {};
    if (query.active !== undefined) filter.active = query.active === 'true';
    return ProFixCategory.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return ProFixCategory.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await ProFixCategory.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const category = new ProFixCategory({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return category.save();
  }

  async update(id, data) {
    return ProFixCategory.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleActive(id) {
    const category = await ProFixCategory.findById(id);
    if (!category) return null;
    category.active = !category.active;
    return category.save();
  }

  async delete(id) {
    return ProFixCategory.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await ProFixCategory.bulkWrite(ops);
  }
}

export default new ProFixCategoryService();

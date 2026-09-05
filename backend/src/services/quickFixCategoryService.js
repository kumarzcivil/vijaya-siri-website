import QuickFixCategory from '../models/quickFix/QuickFixCategory.js';

class QuickFixCategoryService {
  async list(query = {}) {
    const filter = {};
    if (query.active !== undefined) filter.active = query.active === 'true';
    return QuickFixCategory.find(filter).sort({ displayOrder: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return QuickFixCategory.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await QuickFixCategory.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const category = new QuickFixCategory({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return category.save();
  }

  async update(id, data) {
    return QuickFixCategory.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleActive(id) {
    const category = await QuickFixCategory.findById(id);
    if (!category) return null;
    category.active = !category.active;
    return category.save();
  }

  async delete(id) {
    return QuickFixCategory.findByIdAndDelete(id).lean();
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await QuickFixCategory.bulkWrite(ops);
  }
}

export default new QuickFixCategoryService();

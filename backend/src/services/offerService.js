import Offer from '../models/Offer.js';

class OfferService {
  async list(query = {}) {
    const filter = {};
    if (query.active !== undefined) filter.status = query.active === 'true' ? 'active' : 'inactive';
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { subtitle: { $regex: query.search, $options: 'i' } },
      ];
    }
    return Offer.find(filter).sort({ displayOrder: 1, priority: 1, createdAt: 1 }).lean();
  }

  async getById(id) {
    return Offer.findById(id).lean();
  }

  async create(data) {
    const maxOrder = await Offer.findOne().sort({ displayOrder: -1 }).select('displayOrder').lean();
    const offer = new Offer({
      ...data,
      displayOrder: data.displayOrder ?? ((maxOrder?.displayOrder ?? 0) + 1),
    });
    return offer.save();
  }

  async update(id, data) {
    return Offer.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleStatus(id) {
    const offer = await Offer.findById(id);
    if (!offer) return null;
    offer.status = offer.status === 'active' ? 'inactive' : 'active';
    return offer.save();
  }

  async delete(id) {
    return Offer.findByIdAndDelete(id).lean();
  }

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      Offer.countDocuments(),
      Offer.countDocuments({ status: 'active' }),
      Offer.countDocuments({ status: 'inactive' }),
    ]);
    return { total, active, inactive };
  }

  async reorder(orderedIds) {
    const ops = orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: i + 1 } } },
    }));
    if (ops.length) await Offer.bulkWrite(ops);
  }
}

export default new OfferService();

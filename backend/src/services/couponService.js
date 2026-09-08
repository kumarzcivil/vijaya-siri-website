import Coupon from '../models/Coupon.js';

class CouponService {
  async list(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { code: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }
    return Coupon.find(filter).sort({ createdAt: -1 }).lean();
  }

  async listActive() {
    const today = new Date().toISOString().slice(0, 10);
    return Coupon.find({
      status: 'active',
      $or: [
        { startDate: '' },
        { startDate: { $lte: today } },
      ],
      $and: [
        { $or: [{ endDate: '' }, { endDate: { $gte: today } }] },
      ],
    }).sort({ createdAt: -1 }).lean();
  }

  async getById(id) {
    return Coupon.findById(id).lean();
  }

  async create(data) {
    const coupon = new Coupon(data);
    return coupon.save();
  }

  async update(id, data) {
    return Coupon.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after', runValidators: true }).lean();
  }

  async toggleStatus(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) return null;
    coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
    return coupon.save();
  }

  async delete(id) {
    return Coupon.findByIdAndDelete(id).lean();
  }

  async validate(code, serviceType, orderAmount) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).lean();
    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    if (coupon.status !== 'active') return { valid: false, message: 'This coupon is no longer active' };
    if (coupon.serviceType !== 'BOTH' && coupon.serviceType !== serviceType) {
      return { valid: false, message: `This coupon is not valid for ${serviceType.replace('_', ' ')} services` };
    }
    if (coupon.minOrder > 0 && orderAmount < coupon.minOrder) {
      return { valid: false, message: `Minimum order of \u20B9${coupon.minOrder} required` };
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its usage limit' };
    }
    const today = new Date().toISOString().slice(0, 10);
    if (coupon.startDate && coupon.startDate > today) return { valid: false, message: 'This coupon is not yet valid' };
    if (coupon.endDate && coupon.endDate < today) return { valid: false, message: 'This coupon has expired' };

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, orderAmount);

    return {
      valid: true,
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      message: `Coupon applied! You save \u20B9${Math.round(discount)}`,
    };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ status: 'active' }),
    ]);
    return { total, active, inactive: total - active };
  }
}

export default new CouponService();

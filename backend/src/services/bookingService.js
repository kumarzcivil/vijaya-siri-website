import Booking from '../models/Booking.js';

class BookingService {
  async list(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.kind) filter.kind = query.kind;
    if (query.search) {
      filter.$or = [
        { customerName: { $regex: query.search, $options: 'i' } },
        { customerMobile: { $regex: query.search, $options: 'i' } },
        { serviceName: { $regex: query.search, $options: 'i' } },
      ];
    }
    return Booking.find(filter).sort({ createdAt: -1 }).lean();
  }

  async getById(id) {
    return Booking.findById(id).lean();
  }

  async create(data) {
    const booking = new Booking(data);
    return booking.save();
  }

  async updateStatus(id, status) {
    return Booking.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' }).lean();
  }

  async delete(id) {
    return Booking.findByIdAndDelete(id).lean();
  }

  async getStats() {
    const [total, upcoming, completed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'upcoming' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
    ]);
    return { total, upcoming, completed, cancelled };
  }
}

export default new BookingService();

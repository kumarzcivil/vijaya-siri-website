import Booking from '../models/Booking.js';
import notificationService from './notificationService.js';

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
    const saved = await booking.save();

    try {
      const serviceName = saved.serviceName || saved.items?.[0]?.serviceName || 'Service';
      const kindLabel = saved.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix';
      const paymentInfo = saved.paymentMethod ? ` Payment: ${saved.paymentMethod}.` : '';
      await notificationService.createAndPush({
        title: 'New Booking',
        message: `${kindLabel} booking for "${serviceName}" from ${saved.customerName} (${saved.customerMobile}). Amount: \u20B9${saved.amount || 0}.${paymentInfo}`,
        category: 'booking',
        read: false,
      });
    } catch {
      /* notification creation should not block booking */
    }

    return saved;
  }

  async updateStatus(id, status) {
    const updated = await Booking.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' }).lean();

    if (updated) {
      try {
        const statusLabels = { upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' };
        const kindLabel = updated.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix';
        await notificationService.createAndPush({
          title: `Booking ${statusLabels[status] || status}`,
          message: `${kindLabel} booking for "${updated.serviceName}" (${updated.customerName}) has been marked as ${statusLabels[status] || status}.`,
          category: 'booking',
          read: false,
        });
      } catch {
        /* notification creation should not block status update */
      }
    }

    return updated;
  }

  async assignVendor(id, assignedTo, assignedPhone) {
    const update = { assignedTo: assignedTo || '', assignedPhone: assignedPhone || '' };
    const updated = await Booking.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' }).lean();

    if (updated && assignedTo) {
      try {
        const kindLabel = updated.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix';
        await notificationService.createAndPush({
          title: 'Vendor Assigned',
          message: `${kindLabel} booking for "${updated.serviceName}" (${updated.customerName}) assigned to ${assignedTo}.`,
          category: 'booking',
          read: false,
        });
      } catch {
        /* notification creation should not block assignment */
      }
    }

    return updated;
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

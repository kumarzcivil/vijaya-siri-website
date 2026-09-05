import User from '../models/User.js';

const PAGE_SIZE = 20;

export async function listCustomers({ page = 1, search = '', status } = {}) {
  const filter = { role: 'customer' };

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { fullName: regex },
      { email: regex },
      { mobile: regex },
    ];
  }

  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const total = await User.countDocuments(filter);
  const customers = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return {
    customers,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  };
}

export async function getCustomerById(id) {
  return User.findOne({ _id: id, role: 'customer' }).lean();
}

export async function toggleCustomerActive(id) {
  const user = await User.findOne({ _id: id, role: 'customer' });
  if (!user) return null;
  user.isActive = !user.isActive;
  await user.save();
  return user.toJSON();
}

export async function deleteCustomer(id) {
  return User.findOneAndDelete({ _id: id, role: 'customer' });
}

export async function getCustomerStats() {
  const [total, active, inactive] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', isActive: true }),
    User.countDocuments({ role: 'customer', isActive: false }),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignups = await User.countDocuments({
    role: 'customer',
    createdAt: { $gte: thirtyDaysAgo },
  });

  return { total, active, inactive, recentSignups };
}

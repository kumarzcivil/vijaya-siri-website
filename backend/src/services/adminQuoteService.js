import Quote from '../models/Quote.js';

const PAGE_SIZE = 20;

export async function listQuotes({ page = 1, search = '', status, location } = {}) {
  const filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { fullName: regex },
      { email: regex },
      { mobile: regex },
      { refId: regex },
    ];
  }

  if (status) filter.status = status;
  if (location) filter.projectLocation = location;

  const total = await Quote.countDocuments(filter);
  const quotes = await Quote.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return {
    quotes,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  };
}

export async function getQuoteById(id) {
  return Quote.findById(id).lean();
}

export async function updateQuoteStatus(id, status) {
  return Quote.findByIdAndUpdate(id, { status }, { returnDocument: 'after' }).lean();
}

export async function markQuoteRead(id) {
  return Quote.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' }).lean();
}

export async function addQuoteNotes(id, notes) {
  return Quote.findByIdAndUpdate(id, { notes }, { returnDocument: 'after' }).lean();
}

export async function deleteQuote(id) {
  return Quote.findByIdAndDelete(id);
}

export async function getQuoteStats() {
  const [total, newCount, contacted, quoted, closed, unread] = await Promise.all([
    Quote.countDocuments(),
    Quote.countDocuments({ status: 'new' }),
    Quote.countDocuments({ status: 'contacted' }),
    Quote.countDocuments({ status: 'quoted' }),
    Quote.countDocuments({ status: 'closed' }),
    Quote.countDocuments({ isRead: false }),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = await Quote.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  return { total, newCount, contacted, quoted, closed, unread, recentCount };
}

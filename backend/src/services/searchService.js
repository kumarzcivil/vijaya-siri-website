import QuickFixService from '../models/quickFix/QuickFixService.js';
import QuickFixCategory from '../models/quickFix/QuickFixCategory.js';
import ProFixService from '../models/proFix/ProFixService.js';
import ProFixCategory from '../models/proFix/ProFixCategory.js';

class SearchService {
  async search(query) {
    const q = query.trim();
    if (!q) return { quickFix: [], proFix: [] };

    const regex = { $regex: q, $options: 'i' };

    const [quickFixServices, proFixServices] = await Promise.all([
      QuickFixService.find({
        active: true,
        $or: [
          { name: regex },
          { shortDescription: regex },
          { description: regex },
        ],
      })
        .sort({ featured: -1, displayOrder: 1 })
        .limit(20)
        .lean(),
      ProFixService.find({
        active: true,
        $or: [
          { name: regex },
          { description: regex },
        ],
      })
        .sort({ displayOrder: 1 })
        .limit(20)
        .lean(),
    ]);

    const quickFixCategoryIds = [...new Set(quickFixServices.map((s) => s.categoryId))];
    const proFixCategoryIds = [...new Set(proFixServices.map((s) => s.category))];

    const [quickFixCategories, proFixCategories] = await Promise.all([
      quickFixCategoryIds.length
        ? QuickFixCategory.find({ _id: { $in: quickFixCategoryIds } }).lean()
        : [],
      proFixCategoryIds.length
        ? ProFixCategory.find({ _id: { $in: proFixCategoryIds } }).lean()
        : [],
    ]);

    const qfCatMap = Object.fromEntries(quickFixCategories.map((c) => [c._id, c.name]));
    const pfCatMap = Object.fromEntries(proFixCategories.map((c) => [c._id, c.name]));

    const quickFix = quickFixServices.map((s) => ({
      id: s._id,
      type: 'quick-fix',
      name: s.name,
      description: s.shortDescription || s.description || '',
      image: s.image?.url || '',
      category: qfCatMap[s.categoryId] || '',
      price: s.pricing?.enabled ? s.pricing.price : null,
      duration: s.duration ? `~${s.duration.value} ${s.duration.unit}` : null,
      url: `/quick-fix/${s._id}`,
    }));

    const proFix = proFixServices.map((s) => ({
      id: s._id,
      type: 'pro-fix',
      name: s.name,
      description: s.description || '',
      image: s.image?.url || '',
      category: pfCatMap[s.category] || '',
      startingPrice: s.startingPrice || null,
      url: `/pro-fix/${s._id}`,
    }));

    return { quickFix, proFix };
  }
}

export default new SearchService();

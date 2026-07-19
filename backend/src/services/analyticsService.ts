import { Types } from 'mongoose';
import { ClothingItem } from '../models/ClothingItem';
import { Outfit } from '../models/Outfit';

/** Wardrobe statistics: totals, favorites, most/least worn, monthly usage. */
export async function getWardrobeStatistics(ownerId: string) {
  const owner = new Types.ObjectId(ownerId);

  const [totalClothes, favoriteColorAgg, favoriteBrandAgg, mostWorn, leastWorn, monthlyUsage] =
    await Promise.all([
      ClothingItem.countDocuments({ owner }),
      ClothingItem.aggregate([
        { $match: { owner } },
        { $group: { _id: '$color', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      ClothingItem.aggregate([
        { $match: { owner, brand: { $exists: true, $ne: '' } } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      ClothingItem.find({ owner }).sort({ timesWorn: -1 }).limit(5),
      ClothingItem.find({ owner }).sort({ timesWorn: 1 }).limit(5),
      Outfit.aggregate([
        { $match: { owner, isWorn: true, wornAt: { $exists: true } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$wornAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

  return {
    totalClothes,
    favoriteColor: favoriteColorAgg[0]?._id ?? null,
    favoriteBrand: favoriteBrandAgg[0]?._id ?? null,
    mostWornItems: mostWorn,
    leastWornItems: leastWorn,
    monthlyUsage: monthlyUsage.map((m) => ({ month: m._id, count: m.count })),
  };
}

/** Sustainability dashboard: cost-per-wear, usage extremes, donation suggestions. */
export async function getSustainabilityDashboard(ownerId: string) {
  const owner = new Types.ObjectId(ownerId);
  const items = await ClothingItem.find({ owner });

  const withCostPerWear = items.map((item) => {
    const wears = Math.max(item.timesWorn, 0);
    const costPerWear = item.price && wears > 0 ? item.price / wears : item.price ?? 0;
    return { item, costPerWear, wears };
  });

  const sortedByWear = [...withCostPerWear].sort((a, b) => b.wears - a.wears);
  const mostUsed = sortedByWear.slice(0, 5).map((x) => x.item);
  const leastUsed = sortedByWear.slice(-5).reverse().map((x) => x.item);

  const now = Date.now();
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
  const unused = items.filter(
    (i) => i.timesWorn === 0 && (!i.createdAt || now - new Date(i.createdAt).getTime() > NINETY_DAYS)
  );

  const donationSuggestions = unused.slice(0, 10).map((i) => ({
    item: i,
    reason: 'Unworn for 90+ days - consider donating or reselling to make room for pieces you\'ll actually wear.',
  }));

  return {
    costPerWear: withCostPerWear
      .map((x) => ({ itemId: x.item._id, costPerWear: Number(x.costPerWear.toFixed(2)) }))
      .sort((a, b) => b.costPerWear - a.costPerWear),
    mostUsed,
    leastUsed,
    unusedCount: unused.length,
    donationSuggestions,
  };
}

import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { ClothingItem } from '../models/ClothingItem';
import { Outfit } from '../models/Outfit';
import { User } from '../models/User';
import { getCurrentWeather, recommendForWeather } from '../services/weatherService';

/**
 * Aggregates everything the Dashboard screen needs in a single call:
 * today's outfit (most recent saved/generated), weather, AI suggestions,
 * recent outfits, and a wardrobe summary.
 */
export const getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const ownerId = req.user!.userId;
  const user = await User.findById(ownerId);
  const city = user?.city || 'London';

  const [weather, recentOutfits, wardrobeCount, recentlyWorn] = await Promise.all([
    getCurrentWeather(city).catch(() => undefined),
    Outfit.find({ owner: ownerId }).sort({ createdAt: -1 }).limit(5).populate(['top', 'bottom', 'shoes']),
    ClothingItem.countDocuments({ owner: ownerId }),
    ClothingItem.find({ owner: ownerId, timesWorn: { $gt: 0 } }).sort({ lastWornAt: -1 }).limit(4),
  ]);

  const todaysOutfit = recentOutfits[0] || null;
  const suggestions = weather ? recommendForWeather(weather) : null;

  res.json(
    new ApiResponse(200, {
      user: { fullName: user?.fullName },
      weather,
      todaysOutfit,
      aiSuggestions: suggestions,
      recentOutfits,
      recentlyWorn,
      wardrobeSummary: { totalItems: wardrobeCount },
    })
  );
});

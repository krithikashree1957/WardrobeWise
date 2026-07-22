import { Response } from 'express';
import { ClothingItem } from '../models/ClothingItem';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { buildMarketplaceRecommendations } from '../services/marketplaceService';
import { getRecommendationsQuerySchema } from '../validations/marketplaceValidation';

/**
 * GET /marketplace/recommendations
 * Analyzes the caller's wardrobe and returns complementary product
 * recommendations, grouped by the missing category they'd fill.
 */
export const getMarketplaceRecommendations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = getRecommendationsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw ApiError.badRequest('Validation failed', parsed.error.flatten());
  }
  const { limit } = parsed.data;

  const wardrobe = await ClothingItem.find({ owner: req.user!.userId });

  if (wardrobe.length === 0) {
    res.json(
      new ApiResponse(
        200,
        { recommendations: [], wardrobeItemCount: 0 },
        'Add a few wardrobe items first so we can find complementary pieces for you.'
      )
    );
    return;
  }

  const recommendations = buildMarketplaceRecommendations(wardrobe, limit);

  res.json(
    new ApiResponse(200, { recommendations, wardrobeItemCount: wardrobe.length }, 'Marketplace recommendations generated')
  );
});

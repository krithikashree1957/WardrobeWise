import { Response } from 'express';
import { TravelPlan } from '../models/TravelPlan';
import { ClothingItem } from '../models/ClothingItem';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { getCurrentWeather } from '../services/weatherService';
import { recommendProductsForGaps } from '../services/marketplaceService';
import {
  buildTravelChecklist,
  matchChecklistAgainstWardrobe,
  checklistToGaps,
  buildDailyOutfitPlan,
} from '../services/travelPlannerService';

const POPULATE_FIELDS = ['checklist.matchedItem', 'dailyPlans.slots.top', 'dailyPlans.slots.bottom', 'dailyPlans.slots.shoes', 'dailyPlans.slots.outerwear', 'dailyPlans.slots.accessories'];

export const createTravelPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { destination, country, state, days, travelMonth, purpose } = req.body;

  const wardrobe = await ClothingItem.find({ owner: req.user!.userId });

  // Reuses the existing Weather API integration (current conditions for the
  // destination, the same signal the Packing Assistant feature relies on)
  // as a stand-in for a month-specific forecast, since only a live-weather
  // endpoint is available in this project.
  const weather = await getCurrentWeather(destination);

  const rawChecklist = buildTravelChecklist(weather, days, purpose);
  const checklist = matchChecklistAgainstWardrobe(rawChecklist, wardrobe);
  const dailyPlans = buildDailyOutfitPlan(days, wardrobe, weather, purpose);

  const travelPlan = await TravelPlan.create({
    owner: req.user!.userId,
    destination,
    country,
    state,
    days,
    travelMonth,
    purpose,
    expectedWeather: { tempC: weather.tempC, condition: weather.condition, description: weather.description },
    checklist,
    dailyPlans,
  });

  const populated = await travelPlan.populate(POPULATE_FIELDS);

  const gaps = checklistToGaps(checklist, destination);
  const shoppingRecommendations = recommendProductsForGaps(gaps, wardrobe);

  res.status(201).json(
    new ApiResponse(201, { travelPlan: populated, shoppingRecommendations }, 'Travel plan generated')
  );
});

export const listTravelPlans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const travelPlans = await TravelPlan.find({ owner: req.user!.userId })
    .sort({ createdAt: -1 })
    .populate(POPULATE_FIELDS);
  res.json(new ApiResponse(200, { travelPlans }));
});

export const getTravelPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const travelPlan = await TravelPlan.findOne({ _id: req.params.id, owner: req.user!.userId }).populate(
    POPULATE_FIELDS
  );
  if (!travelPlan) throw ApiError.notFound('Travel plan not found');

  const wardrobe = await ClothingItem.find({ owner: req.user!.userId });
  const gaps = checklistToGaps(travelPlan.checklist, travelPlan.destination);
  const shoppingRecommendations = recommendProductsForGaps(gaps, wardrobe);

  res.json(new ApiResponse(200, { travelPlan, shoppingRecommendations }));
});

export const deleteTravelPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await TravelPlan.findOneAndDelete({ _id: req.params.id, owner: req.user!.userId });
  if (!deleted) throw ApiError.notFound('Travel plan not found');
  res.json(new ApiResponse(200, { id: req.params.id }, 'Travel plan deleted'));
});

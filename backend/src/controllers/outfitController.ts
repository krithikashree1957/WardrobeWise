import { Response } from 'express';
import { Outfit } from '../models/Outfit';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateOutfit } from '../services/outfitService';
import { getCurrentWeather } from '../services/weatherService';
import { User } from '../models/User';

export const createOutfitSuggestion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { mood, occasion, city } = req.body;

  const user = await User.findById(req.user!.userId);
  const resolvedCity = city || user?.city || 'London';
  const weather = await getCurrentWeather(resolvedCity).catch(() => undefined);

  const generated = await generateOutfit({ ownerId: req.user!.userId, mood, occasion, weather });
  if (!generated) {
    throw ApiError.badRequest('Not enough wardrobe items to generate an outfit yet. Add more items first.');
  }

  const outfit = await Outfit.create({
    owner: req.user!.userId,
    top: generated.top?._id,
    bottom: generated.bottom?._id,
    shoes: generated.shoes?._id,
    accessories: generated.accessories.map((a) => a._id),
    mood,
    occasion,
    weatherContext: weather ? { tempC: weather.tempC, condition: weather.condition, city: weather.city } : undefined,
    confidenceScore: generated.confidenceScore,
    reasoning: generated.reasoning,
    colorTheoryScheme: generated.colorTheoryScheme,
  });

  const populated = await outfit.populate(['top', 'bottom', 'shoes', 'accessories']);
  res.status(201).json(new ApiResponse(201, { outfit: populated }, 'Outfit generated'));
});

export const listOutfits = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const outfits = await Outfit.find({ owner: req.user!.userId })
    .sort({ createdAt: -1 })
    .populate(['top', 'bottom', 'shoes', 'accessories'])
    .limit(50);
  res.json(new ApiResponse(200, { outfits }));
});

export const getOutfit = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const outfit = await Outfit.findOne({ _id: req.params.id, owner: req.user!.userId }).populate([
    'top', 'bottom', 'shoes', 'accessories',
  ]);
  if (!outfit) throw ApiError.notFound('Outfit not found');
  res.json(new ApiResponse(200, { outfit }));
});

export const saveOutfit = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const outfit = await Outfit.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!.userId },
    { $set: { isSaved: true } },
    { new: true }
  );
  if (!outfit) throw ApiError.notFound('Outfit not found');
  res.json(new ApiResponse(200, { outfit }, 'Outfit saved'));
});

export const markOutfitWorn = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const outfit = await Outfit.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!.userId },
    { $set: { isWorn: true, wornAt: new Date() } },
    { new: true }
  );
  if (!outfit) throw ApiError.notFound('Outfit not found');
  res.json(new ApiResponse(200, { outfit }, 'Outfit marked as worn'));
});

export const deleteOutfit = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const outfit = await Outfit.findOneAndDelete({ _id: req.params.id, owner: req.user!.userId });
  if (!outfit) throw ApiError.notFound('Outfit not found');
  res.json(new ApiResponse(200, {}, 'Outfit deleted'));
});

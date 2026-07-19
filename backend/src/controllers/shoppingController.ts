import { Response } from 'express';
import { ShoppingSuggestion } from '../models/ShoppingSuggestion';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadBufferToCloudinary } from '../services/uploadService';
import { detectClothingAttributes } from '../services/geminiService';
import { evaluateShoppingCandidate } from '../services/shoppingService';

export const evaluatePotentialPurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw ApiError.badRequest('An image file is required');

  const base64 = req.file.buffer.toString('base64');
  const [detection, uploaded] = await Promise.all([
    detectClothingAttributes(base64, req.file.mimetype),
    uploadBufferToCloudinary(req.file.buffer, 'wardrobewise/shopping'),
  ]);

  const category = detection.clothingType?.toLowerCase() || 'accessory';
  const color = detection.color || 'grey';

  const evaluation = await evaluateShoppingCandidate(req.user!.userId, { category, color });

  const suggestion = await ShoppingSuggestion.create({
    owner: req.user!.userId,
    imageUrl: uploaded.url,
    imagePublicId: uploaded.publicId,
    detectedCategory: category,
    detectedColor: color,
    ...evaluation,
  });

  res.status(201).json(new ApiResponse(201, { suggestion, detection }, 'Purchase evaluated'));
});

export const listShoppingSuggestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const suggestions = await ShoppingSuggestion.find({ owner: req.user!.userId })
    .sort({ createdAt: -1 })
    .populate('matchesWardrobe');
  res.json(new ApiResponse(200, { suggestions }));
});

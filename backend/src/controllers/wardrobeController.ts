import { Response } from 'express';
import { ClothingItem } from '../models/ClothingItem';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/uploadService';
import { detectClothingAttributes } from '../services/geminiService';

export const createClothingItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw ApiError.badRequest('An image file is required');

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, 'wardrobewise/items');

  const item = await ClothingItem.create({
    ...req.body,
    owner: req.user!.userId,
    imageUrl: url,
    imagePublicId: publicId,
  });

  res.status(201).json(new ApiResponse(201, { item }, 'Item added to wardrobe'));
});

/**
 * Runs Gemini vision detection on an already-uploaded image (or a fresh
 * upload) and returns suggested attributes WITHOUT persisting anything -
 * the frontend lets the user review/edit before calling createClothingItem.
 */
export const detectItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw ApiError.badRequest('An image file is required');

  const base64 = req.file.buffer.toString('base64');
  const detection = await detectClothingAttributes(base64, req.file.mimetype);

  // We still upload so the user doesn't have to re-select the file later.
  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, 'wardrobewise/items');

  res.json(new ApiResponse(200, { detection, imageUrl: url, imagePublicId: publicId }, 'Detection complete'));
});

export const listClothingItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { category, color, season, occasion, brand, favorite, search } = req.query;
  const filter: Record<string, unknown> = { owner: req.user!.userId };

  if (category) filter.category = category;
  if (color) filter.color = new RegExp(String(color), 'i');
  if (season) filter.season = season;
  if (occasion) filter.occasion = occasion;
  if (brand) filter.brand = new RegExp(String(brand), 'i');
  if (favorite === 'true') filter.isFavorite = true;
  if (search) {
    const re = new RegExp(String(search), 'i');
    filter.$or = [{ color: re }, { brand: re }, { material: re }, { notes: re }];
  }

  const items = await ClothingItem.find(filter).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { items, count: items.length }));
});

export const getClothingItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await ClothingItem.findOne({ _id: req.params.id, owner: req.user!.userId });
  if (!item) throw ApiError.notFound('Item not found');
  res.json(new ApiResponse(200, { item }));
});

export const updateClothingItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await ClothingItem.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!.userId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!item) throw ApiError.notFound('Item not found');
  res.json(new ApiResponse(200, { item }, 'Item updated'));
});

export const deleteClothingItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await ClothingItem.findOneAndDelete({ _id: req.params.id, owner: req.user!.userId });
  if (!item) throw ApiError.notFound('Item not found');
  if (item.imagePublicId) await deleteFromCloudinary(item.imagePublicId).catch(() => undefined);
  res.json(new ApiResponse(200, {}, 'Item deleted'));
});

export const updateLaundryStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await ClothingItem.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!.userId },
    { $set: { laundryStatus: req.body.laundryStatus } },
    { new: true }
  );
  if (!item) throw ApiError.notFound('Item not found');
  res.json(new ApiResponse(200, { item }, 'Laundry status updated'));
});

export const toggleFavorite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await ClothingItem.findOne({ _id: req.params.id, owner: req.user!.userId });
  if (!item) throw ApiError.notFound('Item not found');
  item.isFavorite = !item.isFavorite;
  await item.save();
  res.json(new ApiResponse(200, { item }, 'Favorite toggled'));
});

export const markWorn = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await ClothingItem.findOneAndUpdate(
    { _id: req.params.id, owner: req.user!.userId },
    { $inc: { timesWorn: 1 }, $set: { lastWornAt: new Date(), laundryStatus: 'worn-once' } },
    { new: true }
  );
  if (!item) throw ApiError.notFound('Item not found');
  res.json(new ApiResponse(200, { item }, 'Marked as worn'));
});

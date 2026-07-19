import { Response } from 'express';
import { PackingList } from '../models/PackingList';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { getCurrentWeather } from '../services/weatherService';
import { buildPackingChecklist } from '../services/packingService';

export const createPackingList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { destination, days, startDate } = req.body;

  const weather = await getCurrentWeather(destination);
  const items = buildPackingChecklist(days, weather);

  const packingList = await PackingList.create({
    owner: req.user!.userId,
    destination,
    days,
    startDate,
    expectedWeather: { tempMinC: weather.tempC - 3, tempMaxC: weather.tempC + 3, condition: weather.condition },
    items,
  });

  res.status(201).json(new ApiResponse(201, { packingList }, 'Packing checklist generated'));
});

export const listPackingLists = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const lists = await PackingList.find({ owner: req.user!.userId }).sort({ createdAt: -1 });
  res.json(new ApiResponse(200, { packingLists: lists }));
});

export const togglePackedItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const list = await PackingList.findOne({ _id: req.params.id, owner: req.user!.userId });
  if (!list) throw ApiError.notFound('Packing list not found');

  const item = list.items.find((i) => (i as any)._id.toString() === req.params.itemId);
  if (!item) throw ApiError.notFound('Packing item not found');

  item.packed = !item.packed;
  await list.save();
  res.json(new ApiResponse(200, { packingList: list }));
});

import { Response } from 'express';
import { ClothingItem } from '../models/ClothingItem';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export const getLaundryOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const owner = req.user!.userId;
  const [clean, wornOnce, needsWashing, ironed] = await Promise.all([
    ClothingItem.find({ owner, laundryStatus: 'clean' }),
    ClothingItem.find({ owner, laundryStatus: 'worn-once' }),
    ClothingItem.find({ owner, laundryStatus: 'needs-washing' }),
    ClothingItem.find({ owner, laundryStatus: 'ironed' }),
  ]);
  res.json(new ApiResponse(200, { clean, wornOnce, needsWashing, ironed }));
});

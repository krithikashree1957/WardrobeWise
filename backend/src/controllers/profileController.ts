import { Response } from 'express';
import { User } from '../models/User';
import { Avatar } from '../models/Avatar';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.userId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  res.json(new ApiResponse(200, { user }, 'Profile updated'));
});

export const getAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  let avatar = await Avatar.findOne({ owner: req.user!.userId });
  if (!avatar) {
    avatar = await Avatar.create({ owner: req.user!.userId });
  }
  res.json(new ApiResponse(200, { avatar }));
});

export const updateAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const avatar = await Avatar.findOneAndUpdate(
    { owner: req.user!.userId },
    { $set: req.body },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(new ApiResponse(200, { avatar }, 'Avatar updated'));
});

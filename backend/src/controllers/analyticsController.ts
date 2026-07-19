import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { getWardrobeStatistics, getSustainabilityDashboard } from '../services/analyticsService';

export const getStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await getWardrobeStatistics(req.user!.userId);
  res.json(new ApiResponse(200, { statistics: stats }));
});

export const getSustainability = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const dashboard = await getSustainabilityDashboard(req.user!.userId);
  res.json(new ApiResponse(200, { sustainability: dashboard }));
});

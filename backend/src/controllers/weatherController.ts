import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { getCurrentWeather, recommendForWeather } from '../services/weatherService';

export const getWeatherRecommendation = asyncHandler(async (req: Request, res: Response) => {
  const city = (req.query.city as string) || 'London';
  const weather = await getCurrentWeather(city);
  const recommendations = recommendForWeather(weather);
  res.json(new ApiResponse(200, { weather, recommendations }));
});

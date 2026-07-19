import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { generateColorScheme, ColorScheme } from '../services/colorTheoryService';

const VALID_SCHEMES: ColorScheme[] = ['complementary', 'analogous', 'triadic', 'monochromatic', 'split-complementary'];

export const getColorScheme = asyncHandler(async (req: Request, res: Response) => {
  const { color, scheme } = req.query;
  if (!color || typeof color !== 'string' || !/^#?[0-9a-fA-F]{6}$/.test(color)) {
    throw ApiError.badRequest('Provide a valid 6-digit hex color, e.g. color=674bb5');
  }
  const hex = color.startsWith('#') ? color : `#${color}`;
  const chosenScheme = (scheme as ColorScheme) || 'complementary';
  if (!VALID_SCHEMES.includes(chosenScheme)) {
    throw ApiError.badRequest(`scheme must be one of: ${VALID_SCHEMES.join(', ')}`);
  }

  const result = generateColorScheme(hex, chosenScheme);
  res.json(new ApiResponse(200, result));
});

export const getAllColorSchemes = asyncHandler(async (req: Request, res: Response) => {
  const { color } = req.query;
  if (!color || typeof color !== 'string' || !/^#?[0-9a-fA-F]{6}$/.test(color)) {
    throw ApiError.badRequest('Provide a valid 6-digit hex color, e.g. color=674bb5');
  }
  const hex = color.startsWith('#') ? color : `#${color}`;
  const results = VALID_SCHEMES.map((s) => generateColorScheme(hex, s));
  res.json(new ApiResponse(200, { schemes: results }));
});

import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['men', 'women', 'non-binary', 'prefer-not-to-say']).optional(),
  heightCm: z.number().min(50).max(260).optional(),
  weightKg: z.number().min(20).max(400).optional(),
  skinTone: z.string().optional(),
  bodyShape: z.enum(['athletic', 'rectangular', 'inverted-triangle', 'oval', 'pear', 'hourglass']).optional(),
  fashionPreferences: z.array(z.string()).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

export const updateAvatarSchema = z.object({
  hairStyle: z.string().optional(),
  hairColor: z.string().optional(),
  faceShape: z.string().optional(),
  skinTone: z.string().optional(),
  heightCm: z.number().min(50).max(260).optional(),
  bodyShape: z.string().optional(),
});

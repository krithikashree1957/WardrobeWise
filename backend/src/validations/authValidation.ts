import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is too short').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(10),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});

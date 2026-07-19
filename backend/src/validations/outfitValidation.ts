import { z } from 'zod';

export const generateOutfitSchema = z.object({
  mood: z.enum(['happy', 'confident', 'professional', 'romantic', 'creative', 'casual', 'relaxed', 'energetic']).optional(),
  occasion: z.enum(['college', 'office', 'interview', 'party', 'wedding', 'festival', 'vacation', 'gym', 'casual']).optional(),
  city: z.string().optional(),
});

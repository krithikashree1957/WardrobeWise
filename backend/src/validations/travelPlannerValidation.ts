import { z } from 'zod';

export const createTravelPlanSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  days: z.number().int().min(1).max(60),
  travelMonth: z.string().min(1, 'Travel month is required'),
  purpose: z.string().min(1, 'Purpose of travel is required'),
});

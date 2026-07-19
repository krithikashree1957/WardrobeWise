import { z } from 'zod';

export const createPackingListSchema = z.object({
  destination: z.string().min(1),
  days: z.number().int().min(1).max(60),
  startDate: z.string().optional(),
});

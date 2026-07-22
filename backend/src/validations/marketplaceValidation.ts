import { z } from 'zod';

/**
 * Query params for GET /marketplace/recommendations.
 * `limit` controls how many products are returned per missing category.
 */
export const getRecommendationsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 3))
    .refine((val) => Number.isInteger(val) && val >= 1 && val <= 6, {
      message: 'limit must be an integer between 1 and 6',
    }),
});

import { z } from 'zod';

export const createClothingItemSchema = z.object({
  category: z.enum([
    'top', 'shirt', 'pants', 'jeans', 'dress', 'saree',
    'shoes', 'bag', 'watch', 'jewellery', 'jacket', 'accessory',
  ]),
  material: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().min(1),
  pattern: z.string().optional(),
  sleeveLength: z.string().optional(),
  // multer only produces an array when a field is sent 2+ times; a single
  // selected checkbox arrives as a plain string, so normalize before validating.
  season: z.preprocess(
    (val) => (val === undefined ? val : Array.isArray(val) ? val : [val]),
    z.array(z.enum(['spring', 'summer', 'autumn', 'winter', 'all-season'])).optional()
  ),
  occasion: z.preprocess(
    (val) => (val === undefined ? val : Array.isArray(val) ? val : [val]),
    z.array(
      z.enum(['college', 'office', 'interview', 'party', 'wedding', 'festival', 'vacation', 'gym', 'casual'])
    ).optional()
  ),
  purchaseDate: z.string().optional(),
  // multipart/form-data always sends values as strings, so coerce here
  // rather than requiring the client to send a real JSON number.
  price: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateClothingItemSchema = createClothingItemSchema.partial();

export const updateLaundryStatusSchema = z.object({
  laundryStatus: z.enum(['clean', 'worn-once', 'needs-washing', 'ironed']),
});
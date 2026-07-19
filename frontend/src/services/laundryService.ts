import { api } from '../lib/axios';
import type { ClothingItem } from '../types';

export const laundryService = {
  overview: () =>
    api.get<{
      data: { clean: ClothingItem[]; wornOnce: ClothingItem[]; needsWashing: ClothingItem[]; ironed: ClothingItem[] };
    }>('/laundry'),
};

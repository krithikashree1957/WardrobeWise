import { api } from '../lib/axios';
import type { MarketplaceRecommendation } from '../types';

export const marketplaceService = {
  getRecommendations: (limit = 3) =>
    api.get<{ data: { recommendations: MarketplaceRecommendation[]; wardrobeItemCount: number } }>(
      '/marketplace/recommendations',
      { params: { limit } }
    ),
};

import { api } from '../lib/axios';
import type { MarketplaceRecommendation, TravelPlan } from '../types';

export interface CreateTravelPlanPayload {
  destination: string;
  country: string;
  state?: string;
  days: number;
  travelMonth: string;
  purpose: string;
}

export const travelPlannerService = {
  create: (payload: CreateTravelPlanPayload) =>
    api.post<{ data: { travelPlan: TravelPlan; shoppingRecommendations: MarketplaceRecommendation[] } }>(
      '/travel-planner',
      payload
    ),
  list: () => api.get<{ data: { travelPlans: TravelPlan[] } }>('/travel-planner'),
  get: (id: string) =>
    api.get<{ data: { travelPlan: TravelPlan; shoppingRecommendations: MarketplaceRecommendation[] } }>(
      `/travel-planner/${id}`
    ),
  remove: (id: string) => api.delete(`/travel-planner/${id}`),
};

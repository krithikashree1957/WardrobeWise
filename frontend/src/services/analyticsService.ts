import { api } from '../lib/axios';
import type { SustainabilityDashboard, WardrobeStatistics } from '../types';

export const analyticsService = {
  statistics: () => api.get<{ data: { statistics: WardrobeStatistics } }>('/analytics/statistics'),
  sustainability: () => api.get<{ data: { sustainability: SustainabilityDashboard } }>('/analytics/sustainability'),
};

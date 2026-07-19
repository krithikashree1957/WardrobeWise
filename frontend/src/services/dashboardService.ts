import { api } from '../lib/axios';

export const dashboardService = {
  get: () => api.get('/dashboard'),
};

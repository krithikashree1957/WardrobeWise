import { api } from '../lib/axios';

export const weatherServiceApi = {
  recommendation: (city: string) => api.get('/weather', { params: { city } }),
};

import { api } from '../lib/axios';

export const colorService = {
  scheme: (color: string, scheme: string) => api.get('/colors/scheme', { params: { color, scheme } }),
  allSchemes: (color: string) => api.get('/colors/schemes', { params: { color } }),
};

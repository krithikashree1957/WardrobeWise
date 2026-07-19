import { api } from '../lib/axios';
import type { Outfit } from '../types';

export const outfitService = {
  generate: (payload: { mood?: string; occasion?: string; city?: string }) =>
    api.post<{ data: { outfit: Outfit } }>('/outfits/generate', payload),
  list: () => api.get<{ data: { outfits: Outfit[] } }>('/outfits'),
  get: (id: string) => api.get<{ data: { outfit: Outfit } }>(`/outfits/${id}`),
  save: (id: string) => api.patch(`/outfits/${id}/save`),
  markWorn: (id: string) => api.patch(`/outfits/${id}/worn`),
  remove: (id: string) => api.delete(`/outfits/${id}`),
};

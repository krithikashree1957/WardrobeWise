import { api } from '../lib/axios';
import type { ClothingItem } from '../types';

export interface WardrobeFilters {
  category?: string;
  color?: string;
  season?: string;
  occasion?: string;
  brand?: string;
  favorite?: boolean;
  search?: string;
}

export const wardrobeService = {
  list: (filters: WardrobeFilters = {}) =>
    api.get<{ data: { items: ClothingItem[]; count: number } }>('/wardrobe', { params: filters }),

  get: (id: string) => api.get<{ data: { item: ClothingItem } }>(`/wardrobe/${id}`),

  detect: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/wardrobe/detect', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  create: (file: File, fields: Record<string, unknown>) => {
    const form = new FormData();
    form.append('image', file);
    Object.entries(fields).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v.forEach((item) => form.append(k, String(item)));
      else form.append(k, String(v));
    });
    return api.post('/wardrobe', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  update: (id: string, fields: Partial<ClothingItem>) => api.patch(`/wardrobe/${id}`, fields),
  remove: (id: string) => api.delete(`/wardrobe/${id}`),
  updateLaundry: (id: string, laundryStatus: string) => api.patch(`/wardrobe/${id}/laundry`, { laundryStatus }),
  toggleFavorite: (id: string) => api.patch(`/wardrobe/${id}/favorite`),
  markWorn: (id: string) => api.patch(`/wardrobe/${id}/worn`),
};

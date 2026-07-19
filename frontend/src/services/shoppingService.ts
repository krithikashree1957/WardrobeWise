import { api } from '../lib/axios';
import type { ShoppingSuggestion } from '../types';

export const shoppingService = {
  evaluate: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post<{ data: { suggestion: ShoppingSuggestion } }>('/shopping/evaluate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get<{ data: { suggestions: ShoppingSuggestion[] } }>('/shopping'),
};

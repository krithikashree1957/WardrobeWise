import { api } from '../lib/axios';
import type { PackingList } from '../types';

export const packingService = {
  create: (payload: { destination: string; days: number; startDate?: string }) =>
    api.post<{ data: { packingList: PackingList } }>('/packing', payload),
  list: () => api.get<{ data: { packingLists: PackingList[] } }>('/packing'),
  toggleItem: (listId: string, itemId: string) => api.patch(`/packing/${listId}/items/${itemId}/toggle`),
};

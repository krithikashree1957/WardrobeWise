import { api } from '../lib/axios';
import type { ChatMessage } from '../types';

export const assistantService = {
  send: (message: string) => api.post<{ data: { reply: ChatMessage } }>('/assistant/chat', { message }),
  history: () => api.get<{ data: { history: ChatMessage[] } }>('/assistant/history'),
};

import { api } from '../lib/axios';
import type { Avatar, User } from '../types';

export const profileService = {
  update: (fields: Partial<User>) => api.patch<{ data: { user: User } }>('/profile', fields),
  getAvatar: () => api.get<{ data: { avatar: Avatar } }>('/profile/avatar'),
  updateAvatar: (fields: Partial<Avatar>) => api.patch<{ data: { avatar: Avatar } }>('/profile/avatar', fields),
};

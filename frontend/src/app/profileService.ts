import { apiRequest } from './api';
import { ProfileDTO } from './types';

export const profileService = {
  fetchProfile: () => apiRequest<ProfileDTO>('/profile'),

  updateProfile: (data: ProfileDTO) =>
    apiRequest<ProfileDTO>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Password management
  verifyPassword: (username: string, password: string) =>
    apiRequest<void>('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};
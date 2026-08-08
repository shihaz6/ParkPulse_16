import { apiRequest } from './api';

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  username: string;
  password?: string;
  access: string;
  active: boolean;
  customPermissions: string[];
  avatar?: string;
  phone?: string;
  joinDate?: string;
  address?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  shift?: string;
  status?: string;
}

export interface StaffFormData {
  name: string;
  role: string;
  email: string;
  username: string;
  password?: string;
  access: string;
  active: boolean;
  customPermissions: string[];
  avatar?: string;
  phone?: string;
  joinDate?: string;
  address?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  shift?: string;
  status?: string;
}

export const staffService = {
  fetchStaff: () => apiRequest<Staff[]>('/staff'),

  saveStaff: (data: StaffFormData) =>
    apiRequest<Staff>('/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  saveStaffWithImage: (formData: FormData) =>
    apiRequest<Staff>('/staff', {
      method: 'POST',
      body: formData,
    }),

  updateStaff: (id: string, data: StaffFormData) =>
    apiRequest<Staff>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStaffWithImage: (id: string, formData: FormData) =>
    apiRequest<Staff>(`/staff/${id}`, {
      method: 'PUT',
      body: formData,
    }),

  deleteStaff: (id: string) =>
    apiRequest<void>(`/staff/${id}`, {
      method: 'DELETE',
    }),

  getStaff: (id: string) => apiRequest<Staff>(`/staff/${id}`),

  verifyPassword: (username: string, password: string) =>
    apiRequest<void>('/staff/verify-password', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  updatePassword: (username: string, newPassword: string) =>
    apiRequest<void>('/staff/update-password', {
      method: 'POST',
      body: JSON.stringify({ username, newPassword }),
    }),
};
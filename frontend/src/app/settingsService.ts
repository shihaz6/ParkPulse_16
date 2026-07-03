import { apiRequest } from './api';
import { GeneralSettings, SecuritySettings, ZoneSettings, AccessControlSettings, Plan, HistoryFilters, PagedResponse, Ticket } from './types';

export const settingsService = {
  // General Settings
  fetchGeneral: () => apiRequest<GeneralSettings>('/settings/general'),

  updateGeneral: (data: GeneralSettings) =>
    apiRequest<GeneralSettings>('/settings/general', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Security Settings
  fetchSecurity: () => apiRequest<SecuritySettings>('/settings/security'),

  updateSecurity: (data: SecuritySettings) =>
    apiRequest<SecuritySettings>('/settings/security', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Zone Settings (Slot Settings)
  fetchZoneSettings: () => apiRequest<ZoneSettings>('/settings/zones'),

  updateZoneSettings: (data: ZoneSettings) =>
    apiRequest<ZoneSettings>('/settings/zones', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Access Control Settings
  fetchAccessControl: () => apiRequest<AccessControlSettings>('/settings/access-control'),

  updateAccessControl: (data: AccessControlSettings) =>
    apiRequest<AccessControlSettings>('/settings/access-control', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // History
  fetchHistory: (filters?: HistoryFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return apiRequest<PagedResponse<Ticket>>(`/settings/history?${params.toString()}`);
  },

  fetchHistoryById: (id: string) => apiRequest<Ticket>(`/settings/history/${id}`),
};

// Plan Service
export const planService = {
  fetchPlans: () => apiRequest<Plan[]>('/plans'),

  savePlan: (data: Plan) =>
    apiRequest<Plan>('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePlan: (id: string, data: Plan) =>
    apiRequest<Plan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePlan: (id: string) =>
    apiRequest<void>(`/plans/${id}`, {
      method: 'DELETE',
    }),
};
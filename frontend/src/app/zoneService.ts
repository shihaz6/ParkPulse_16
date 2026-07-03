import { apiRequest } from './api';

export interface Zone {
  id: string;
  name: string;
  prefix: string;
  totalSlots: number;
  reservedSlots: number;
  ratePerHour: number;
  rateType: string;
  vehicleTypes: string[];
  overflowAlert: boolean;
  autoRelease: boolean;
  releaseTimeout: number;
  color: string;
  status: string;
  occupiedSlots?: number;
  availableSlots?: number;
}

export const zoneService = {
  fetchZones: () => apiRequest<Zone[]>('/zones'),
  getZone: (id: string) => apiRequest<Zone>(`/zones/${id}`),
  saveZone: (data: Zone) => apiRequest<Zone>('/zones', { method: 'POST', body: JSON.stringify(data) }),
  updateZone: (id: string, data: Zone) => apiRequest<Zone>(`/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteZone: (id: string) => apiRequest<void>(`/zones/${id}`, { method: 'DELETE' }),
};

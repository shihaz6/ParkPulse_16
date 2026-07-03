import { apiRequest } from './api';

export interface ParkingSlot {
  id: string;
  occupied: boolean;
  reserved: boolean;
  maintenance: boolean;
  maintenanceNotes?: string;
  vehicle?: string;
  vehicleType?: string;
  ownerName?: string;
  phone?: string;
  notes?: string;
  entryTime?: string;
}

export interface ParkingSession {
  slotId: string;
  vehicle: string;
  entryTime: string;
}

export const parkingService = {
  fetchSlots: () => apiRequest<ParkingSlot[]>('/parking/slots'),

  fetchAvailableSlots: () => apiRequest<ParkingSlot[]>('/parking/slots/available'),

  toggleSlot: (id: string, body?: { vehicle?: string; entryTime?: string }) =>
    apiRequest<ParkingSlot>(`/parking/slots/toggle/${id}`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  reserveSlot: (id: string) =>
    apiRequest<ParkingSlot>(`/parking/slots/${id}/reserve`, { method: 'POST' }),

  releaseSlotReservation: (id: string) =>
    apiRequest<ParkingSlot>(`/parking/slots/${id}/release-reservation`, { method: 'POST' }),

  setMaintenance: (id: string, notes?: string) =>
    apiRequest<ParkingSlot>(`/parking/slots/${id}/maintenance`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes || '' }),
    }),

  clearMaintenance: (id: string) =>
    apiRequest<ParkingSlot>(`/parking/slots/${id}/clear-maintenance`, { method: 'POST' }),

  fetchSessions: () => apiRequest<ParkingSession[]>('/parking/sessions'),

  fetchPeakHours: () => apiRequest<number[]>('/parking/peak-hours'),

  checkoutSlot: (id: string, paymentMethod: string, ratePerHour: number) =>
    apiRequest<{ slot: ParkingSlot; ticket: any }>(`/parking/slots/checkout/${id}`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, ratePerHour: String(ratePerHour) }),
    }),
};
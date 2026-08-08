import { apiRequest } from './api';

export interface Reservation {
  id: string;
  slotId: string;
  reservedFor: string;
  reservedForType: 'member' | 'staff';
  reservedForEmail: string;
  plate?: string;
  vehicleType?: string;
  ownerName?: string;
  entryTime?: string;
  exitTime?: string;
  status: 'RESERVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  reservedAt: string;
}

export const reservationService = {
  createReservation: (data: { slotId: string; reservedFor: string; reservedForType: string; reservedForEmail: string }) =>
    apiRequest<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkinReservation: (id: string, data: { plate?: string; vehicleType?: string; ownerName?: string }) =>
    apiRequest<Reservation>(`/reservations/${id}/checkin`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  completeReservation: (id: string) =>
    apiRequest<Reservation>(`/reservations/${id}/complete`, {
      method: 'PUT',
    }),

  cancelReservation: (id: string) =>
    apiRequest<Reservation>(`/reservations/${id}/cancel`, {
      method: 'PUT',
    }),

  fetchReservations: () =>
    apiRequest<Reservation[]>('/reservations'),

  getReservation: (id: string) =>
    apiRequest<Reservation>(`/reservations/${id}`),
};

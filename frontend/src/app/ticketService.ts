import { apiRequest } from './api';

export interface BackendTicket {
  id: string;
  vehiclePlate: string;
  ownerName: string;
  slot: string;
  entryTime: string;
  exitTime?: string;
  amount?: number;
  status: 'ONGOING' | 'FINISHED';
  vehicleType: string;
  paymentMethod?: string;
  ratePerHour?: number;
  durationMins?: number;
  zone?: string;
}

export const ticketService = {
  fetchTickets: () =>
    apiRequest<BackendTicket[]>('/tickets'),

  fetchTicket: (id: string) =>
    apiRequest<BackendTicket>(`/tickets/${id}`),

  createTicket: (ticket: BackendTicket) =>
    apiRequest<BackendTicket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    }),

  updateTicket: (id: string, ticket: BackendTicket) =>
    apiRequest<BackendTicket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticket),
    }),

  deleteTicket: (id: string) =>
    apiRequest<void>(`/tickets/${id}`, {
      method: 'DELETE',
    }),

  checkoutTicket: (id: string, paymentMethod: string) =>
    apiRequest<BackendTicket>(`/tickets/${id}/checkout`, {
      method: 'POST',
      params: { paymentMethod },
    }),
};

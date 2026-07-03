import { apiRequest } from './api';

export interface Member {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  plan: string;
  vehicles: number;
  joined: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  password?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  color: string;
  features: string[];
  maxVehicles: string;
  status: string;
  popular: boolean;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  professional: number;
  basic: number;
  totalVehicles: number;
}

export const memberService = {
  fetchMembers: () => apiRequest<Member[]>('/members'),
  
  fetchPlans: () => apiRequest<MembershipPlan[]>('/plans'),
  
  getStats: () => apiRequest<MemberStats>('/members/stats'),
  
  createMember: (member: Member) => 
    apiRequest<Member>('/members/register', {
      method: 'POST',
      body: JSON.stringify(member),
    }),
  
  updateMember: (id: string, member: Member) => 
    apiRequest<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    }),
  
  deleteMember: (id: string) => 
    apiRequest<void>(`/members/${id}`, {
      method: 'DELETE',
    }),
  
  getMemberById: (id: string) => 
    apiRequest<Member>(`/members/${id}`),

  suspendMember: (id: string) =>
    apiRequest<Member>(`/members/${id}/suspend`, {
      method: 'PUT',
    }),

  activateMember: (id: string) =>
    apiRequest<Member>(`/members/${id}/activate`, {
      method: 'PUT',
    }),

  deactivateMember: (id: string) =>
    apiRequest<Member>(`/members/${id}/deactivate`, {
      method: 'PUT',
    }),

  // Plan CRUD
  createPlan: (plan: MembershipPlan) =>
    apiRequest<MembershipPlan>('/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),

  updatePlan: (id: string, plan: MembershipPlan) =>
    apiRequest<MembershipPlan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    }),

  deletePlan: (id: string) =>
    apiRequest<void>(`/plans/${id}`, {
      method: 'DELETE',
    }),

  // Payment validation
  validateCard: (card: { holder: string; number: string; expiry: string; cvv: string }) =>
    apiRequest<{ valid: boolean; message: string }>('/payments/validate-card', {
      method: 'POST',
      body: JSON.stringify(card),
    }),

  checkUsernameAvailability: (username: string) =>
    apiRequest<{ available: boolean; message: string }>('/payments/check-username', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
};
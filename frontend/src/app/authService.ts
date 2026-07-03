import { apiRequest } from './api';

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  access?: string;
  permissions?: string[];
  name?: string;
  email?: string;
  plan?: string;
  status?: string;
  joinedDate?: string;
  vehicles?: number;
  billingCycle?: string;
  nextRenewalDate?: string;
  daysRemaining?: number;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  // Save token and user info to localStorage for JWT authentication
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    if (data.access) localStorage.setItem('access', data.access);
    if (data.permissions) localStorage.setItem('permissions', JSON.stringify(data.permissions));
    if (data.name) localStorage.setItem('memberName', data.name);
    if (data.email) localStorage.setItem('memberEmail', data.email);
    if (data.plan) localStorage.setItem('memberPlan', data.plan);
    if (data.status) localStorage.setItem('memberStatus', data.status);
    if (data.joinedDate) localStorage.setItem('memberJoinedDate', data.joinedDate);
    if (data.vehicles !== undefined) localStorage.setItem('memberVehicles', String(data.vehicles));
    if (data.billingCycle) localStorage.setItem('memberBillingCycle', data.billingCycle);
    if (data.nextRenewalDate) localStorage.setItem('memberNextRenewalDate', data.nextRenewalDate);
    if (data.daysRemaining !== undefined) localStorage.setItem('memberDaysRemaining', String(data.daysRemaining));
  }

  return data;
}

export function logout() {
  ['token', 'username', 'role', 'access', 'permissions', 'memberName', 'memberEmail', 'memberPlan', 'memberStatus', 'memberJoinedDate', 'memberVehicles', 'memberBillingCycle', 'memberNextRenewalDate', 'memberDaysRemaining'].forEach(k => localStorage.removeItem(k));
  window.location.reload();
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getCurrentUser(): { username: string; role: string } | null {
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  if (username && role) {
    return { username, role };
  }
  return null;
}
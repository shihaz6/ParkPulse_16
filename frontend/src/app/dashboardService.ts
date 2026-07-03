import { apiRequest } from './api';

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  totalVehicles: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  dailyRevenue: number;
  ticketRevenue: number;
  membershipRevenue: number;
  totalSessions: number;
  totalSlots: number;
  totalZones: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  occupancyRate: number;
  peakHours: number[];
  weeklyTraffic: Record<string, number>;
}

export const dashboardService = {
  fetchSummary: () => apiRequest<DashboardSummary>('/reports/summary'),
  fetchMemberStats: () => apiRequest<MemberStats>('/members/stats'),
};

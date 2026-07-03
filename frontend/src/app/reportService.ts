import { apiRequest } from './api';

export type ReportType = 'Occupancy' | 'Revenue' | 'Member Activity' | 'Tickets' | 'Vehicle Log' | 'Zone Summary';
export type ReportFormat = 'PDF' | 'CSV' | 'Excel';
export type ReportStatus = 'ready' | 'generating' | 'failed';

export interface Report {
  id: number | string;
  name: string;
  type: string;
  format: string;
  dateRange: string;
  generatedAt: string;
  status: ReportStatus;
  sizeKb: number;
  generatedBy: string;
  fixed: boolean;
  fixedAt?: string | null;
  fixedBy?: string | null;
  description?: string;
}

export interface ReportSummary {
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

export interface ReportStats {
  total: number;
  ready: number;
  generating: number;
  failed: number;
  totalSizeKb: number;
}

export interface DownloadResult {
  blob: Blob;
  filename: string;
}

export const reportService = {
  fetchReports: () => apiRequest<Report[]>('/reports'),

  fetchSummary: () => apiRequest<ReportSummary>('/reports/summary'),

  fetchStats: () => apiRequest<ReportStats>('/reports/stats'),

  fetchReportById: (id: number | string) => apiRequest<Report>(`/reports/${id}`),

  generateReport: (data: {
    name: string;
    type: string;
    format: string;
    dateRange: string;
    generatedBy?: string;
  }) =>
    apiRequest<Report>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteReport: (id: number | string) =>
    apiRequest<void>(`/reports/${id}`, {
      method: 'DELETE',
    }),

  toggleFixed: (id: number | string, fixedBy: string = 'Admin') =>
    apiRequest<Report>(`/reports/${id}/fix`, {
      method: 'PUT',
      body: JSON.stringify({ fixedBy }),
    }),

  downloadReport: async (id: number | string): Promise<DownloadResult> => {
    const BASE_URL = 'http://localhost:8080/api';
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/reports/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `report_${id}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    return { blob, filename };
  },
};

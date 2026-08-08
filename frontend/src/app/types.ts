// Role definitions directly matching your UI
export type UserRole = 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'OPERATOR' 
  | 'INACTIVE_OPERATOR' 
  | 'CUSTOM' 
  | 'MEMBER';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface Zone {
  id: number;
  name: string;
  allowedVehicles: string[];
  feePerHour: number;
  totalSlots: number;
  availableSlots: number;
}

// Settings types
export interface GeneralSettings {
  facilityName: string;
  timezone: string;
  currency: string;
  darkMode: boolean;
  autoRefresh: boolean;
}

export interface SecuritySettings {
  sessionTimeout: string;
  limitEnabled: boolean;
  maxFailedAttempts: string;
  lockoutDuration: string;
}

export interface ZoneSettings {
  defaultTotalSlots: number;
  defaultReservedSlots: number;
  defaultRatePerHour: number;
  defaultRateType: string;
  defaultVehicleTypes: string[];
  defaultOverflowAlert: boolean;
  defaultAutoRelease: boolean;
  defaultReleaseTimeout: number;
}

export interface AccessControlSettings {
  defaultAdminPermissions: string;
  defaultManagerPermissions: string;
  defaultOperatorPermissions: string;
  defaultViewerPermissions: string;
  customRolesJson: string;
  maxConcurrentSessions: number;
  requireMfaForAdmin: boolean;
  requireMfaForManager: boolean;
  sessionTimeoutMinutes: number;
  allowPasswordReset: boolean;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  defaultCustomPermissions: string[];
}

export interface HistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  zoneId?: string;
  vehiclePlate?: string;
  status?: string;
  memberId?: string;
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Ticket {
  id: string;
  vehiclePlate: string;
  ownerName: string;
  slot: string;
  entryTime: string;
  exitTime?: string;
  amount?: number;
  status: string;
  vehicleType: string;
  paymentMethod?: string;
}

// Timezone options
export interface TimezoneOption {
  value: string;
  label: string;
}

// Currency options
export interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

// Constants
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'UTC-12:00', label: 'UTC-12:00 — Baker Island' },
  { value: 'UTC-11:00', label: 'UTC-11:00 — Niue' },
  { value: 'UTC-10:00', label: 'UTC-10:00 — Hawaii' },
  { value: 'UTC-09:00', label: 'UTC-09:00 — Alaska' },
  { value: 'UTC-08:00', label: 'UTC-08:00 — Pacific Time' },
  { value: 'UTC-07:00', label: 'UTC-07:00 — Mountain Time' },
  { value: 'UTC-06:00', label: 'UTC-06:00 — Central Time' },
  { value: 'UTC-05:00', label: 'UTC-05:00 — Eastern Time' },
  { value: 'UTC-04:00', label: 'UTC-04:00 — Atlantic Time' },
  { value: 'UTC-03:00', label: 'UTC-03:00 — Buenos Aires' },
  { value: 'UTC-02:00', label: 'UTC-02:00 — Mid-Atlantic' },
  { value: 'UTC-01:00', label: 'UTC-01:00 — Azores' },
  { value: 'UTC+00:00', label: 'UTC+00:00 — London/GMT' },
  { value: 'UTC+01:00', label: 'UTC+01:00 — Paris/Berlin' },
  { value: 'UTC+02:00', label: 'UTC+02:00 — Cairo/Johannesburg' },
  { value: 'UTC+03:00', label: 'UTC+03:00 — Moscow/Istanbul' },
  { value: 'UTC+04:00', label: 'UTC+04:00 — Dubai' },
  { value: 'UTC+05:00', label: 'UTC+05:00 — Karachi' },
  { value: 'UTC+05:30', label: 'UTC+05:30 — India/Sri Lanka' },
  { value: 'UTC+06:00', label: 'UTC+06:00 — Dhaka' },
  { value: 'UTC+07:00', label: 'UTC+07:00 — Bangkok/Jakarta' },
  { value: 'UTC+08:00', label: 'UTC+08:00 — Beijing/Singapore' },
  { value: 'UTC+09:00', label: 'UTC+09:00 — Tokyo/Seoul' },
  { value: 'UTC+10:00', label: 'UTC+10:00 — Sydney/Melbourne' },
  { value: 'UTC+11:00', label: 'UTC+11:00 — Solomon Islands' },
  { value: 'UTC+12:00', label: 'UTC+12:00 — Auckland/Fiji' },
  { value: 'UTC+13:00', label: 'UTC+13:00 — Tonga' },
  { value: 'UTC+14:00', label: 'UTC+14:00 — Kiribati' },
];

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'lkr', label: 'LKR — Sri Lankan Rupee', symbol: 'රු' },
  { value: 'usd', label: 'USD — US Dollar', symbol: '$' },
  { value: 'eur', label: 'EUR — Euro', symbol: '€' },
  { value: 'gbp', label: 'GBP — British Pound', symbol: '£' },
  { value: 'inr', label: 'INR — Indian Rupee', symbol: '₹' },
  { value: 'aud', label: 'AUD — Australian Dollar', symbol: 'A$' },
  { value: 'cad', label: 'CAD — Canadian Dollar', symbol: 'C$' },
  { value: 'sgd', label: 'SGD — Singapore Dollar', symbol: 'S$' },
  { value: 'jpy', label: 'JPY — Japanese Yen', symbol: '¥' },
  { value: 'cny', label: 'CNY — Chinese Yuan', symbol: '¥' },
];
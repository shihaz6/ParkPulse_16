import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Line, Label,
} from 'recharts';
import {
  ParkingSquare, Users, FileText, Crown,
  TrendingUp, Clock, CheckCircle, XCircle, ArrowUpRight, RefreshCw,
} from 'lucide-react';
import { reportService, ReportSummary } from '../reportService';
import { memberService, MembershipPlan, MemberStats } from '../memberService';
import { zoneService, Zone } from '../zoneService';

interface Props {
  occupiedSlots?: number;
  totalSlots?: number;
  currencySymbol: string;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  inactive: '#6b7280',
  suspended: '#ef4444',
  pending: '#f59e0b',
};

export function AnalyticsSection({ occupiedSlots = 0, totalSlots = 0, currencySymbol }: Props) {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, ms, z, p] = await Promise.all([
        reportService.fetchSummary().catch(() => null),
        memberService.getStats().catch(() => null),
        zoneService.fetchZones().catch(() => []),
        memberService.fetchPlans().catch(() => []),
      ]);
      if (s) setSummary(s);
      if (ms) setMemberStats(ms);
      if (z) setZones(z);
      if (p) setPlans(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !summary && !memberStats) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const revenue = summary?.totalRevenue ?? 0;
  const dailyRev = summary?.dailyRevenue ?? 0;
  const occupancyRate = summary?.occupancyRate ?? (totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0);
  const totalZones = summary?.totalZones ?? zones.length;
  const activeMembers = summary?.activeMembers ?? memberStats?.active ?? 0;
  const totalSessions = summary?.totalSessions ?? 0;

  const memberPieData = memberStats ? [
    { name: 'Active', value: memberStats.active, color: STATUS_COLORS.active },
    { name: 'Inactive', value: memberStats.inactive, color: STATUS_COLORS.inactive },
    { name: 'Suspended', value: memberStats.suspended, color: STATUS_COLORS.suspended },
  ].filter(d => d.value > 0) : [];

  const weeklyTrafficData = summary?.weeklyTraffic
    ? Object.entries(summary.weeklyTraffic).map(([day, count]) => ({ day, count }))
    : [];

  const zoneOccupancyData = zones.map(z => ({
    name: z.name.split('—')[0]?.trim() || z.name,
    total: z.totalSlots,
    occupied: z.occupiedSlots ?? Math.round(z.totalSlots * (occupancyRate / 100)),
    rate: z.ratePerHour,
  }));

  const peakHours = summary?.peakHours?.length
    ? Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        value: summary.peakHours.includes(i) ? 1 : 0,
      }))
    : [];

  const planData = plans.map(p => ({
    name: p.name,
    price: typeof p.monthlyPrice === 'string' ? parseFloat(p.monthlyPrice) : p.monthlyPrice,
    color: p.color,
  }));

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: `${currencySymbol}${revenue.toLocaleString()}`,
      sub: `${currencySymbol}${dailyRev.toFixed(2)} today`,
      icon: TrendingUp,
      gradient: 'from-blue-600 to-blue-800',
    },
    {
      label: 'Occupancy',
      value: `${Math.round(occupancyRate)}%`,
      sub: `${occupiedSlots} / ${totalSlots} slots filled`,
      icon: ParkingSquare,
      gradient: 'from-emerald-600 to-emerald-800',
    },
    {
      label: 'Active Members',
      value: activeMembers.toString(),
      sub: `${memberStats?.total ?? 0} total members`,
      icon: Users,
      gradient: 'from-violet-600 to-violet-800',
    },
    {
      label: 'Zones',
      value: totalZones.toString(),
      sub: `${zones.reduce((a, z) => a + z.totalSlots, 0)} total slots`,
      icon: FileText,
      gradient: 'from-amber-600 to-amber-800',
    },
  ];

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm">Real-time overview of your parking facility.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent rounded-lg text-sm transition-colors border border-border">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="relative rounded-2xl overflow-hidden border border-border">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`} />
              <div className="relative p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white/80">{card.label}</span>
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                <div className="text-xs text-white/70 mt-1">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {revenue > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Revenue Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily Revenue</span>
                <span className="font-semibold tabular-nums">{currencySymbol}{dailyRev.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ticket Revenue</span>
                <span className="font-semibold tabular-nums">{currencySymbol}{(summary?.ticketRevenue ?? 0).toFixed(2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Membership Revenue</span>
                <span className="font-semibold tabular-nums">{currencySymbol}{(summary?.membershipRevenue ?? 0).toFixed(2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold text-blue-500 tabular-nums">{currencySymbol}{revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {memberPieData.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Members by Status
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={memberPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {memberPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {memberPieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalSessions > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border col-span-1">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Sessions Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Sessions</span>
                <span className="font-semibold tabular-nums">{totalSessions}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Now</span>
                <span className="font-semibold tabular-nums">{occupiedSlots}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                <span className="font-semibold tabular-nums">{Math.round(occupancyRate)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {weeklyTrafficData.length > 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Weekly Traffic
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrafficData}>
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Area type="monotone" dataKey="count" stroke={COLORS.primary} fill="url(#trafficGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {zoneOccupancyData.length > 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <ParkingSquare className="w-4 h-4 text-blue-500" />
            Zone Occupancy
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={zoneOccupancyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="total" fill={COLORS.primary} opacity={0.2} barSize={20} />
              <Bar dataKey="occupied" fill={COLORS.primary} barSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {planData.length > 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Plan Pricing Comparison
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={planData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                {planData.map((entry, index) => {
                  const colorMap: Record<string, string> = {
                    blue: COLORS.primary,
                    emerald: COLORS.success,
                    violet: COLORS.purple,
                    amber: COLORS.warning,
                    rose: COLORS.pink,
                    teal: COLORS.teal,
                    indigo: '#6366f1',
                  };
                  return <Cell key={index} fill={colorMap[entry.color] ?? COLORS.primary} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

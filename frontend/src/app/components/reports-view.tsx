import { useState, useMemo, useEffect } from 'react';
import {
  FileText, Plus, Download, Trash2, Calendar, Clock,
  TrendingUp, Users, Car, Ticket, BarChart2, CheckCircle2,
  AlertTriangle, Activity, Filter, X, FileDown,
  RefreshCw, Search, Eye, CircleDot, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { reportService, Report, ReportSummary, ReportStats, DownloadResult } from '../reportService';

type ReportType = 'Occupancy' | 'Revenue' | 'Member Activity' | 'Tickets' | 'Vehicle Log' | 'Zone Summary';
type ReportFormat = 'PDF' | 'CSV' | 'Excel';
type ReportStatus = 'ready' | 'generating' | 'failed';

function toDate(d: Date | string | null | undefined): Date {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  return new Date(d);
}

function timeSince(d: Date | string) {
  const secs = Math.floor((Date.now() - toDate(d).getTime()) / 1000);
  if (secs < 60)       return 'just now';
  if (secs < 3600)     return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400)    return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function fmtDate(d: Date | string) {
  return toDate(d).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const TYPE_CFG: Record<string, { color: string; bg: string; Icon: typeof FileText }> = {
  'Occupancy':       { color: 'text-blue-500',    bg: 'bg-blue-500/10',    Icon: BarChart2   },
  'Revenue':         { color: 'text-emerald-500', bg: 'bg-emerald-500/10', Icon: TrendingUp  },
  'Member Activity': { color: 'text-violet-500',  bg: 'bg-violet-500/10',  Icon: Users       },
  'Tickets':         { color: 'text-amber-500',   bg: 'bg-amber-500/10',   Icon: Ticket      },
  'Vehicle Log':     { color: 'text-cyan-500',    bg: 'bg-cyan-500/10',    Icon: Car         },
  'Zone Summary':    { color: 'text-teal-500',    bg: 'bg-teal-500/10',    Icon: Activity    },
};

const STATUS_CFG: Record<ReportStatus, { label: string; color: string; bg: string; border: string }> = {
  ready:      { label: 'Ready',      color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  generating: { label: 'Generating', color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
  failed:     { label: 'Failed',     color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
};

const FORMAT_COLORS: Record<ReportFormat, string> = {
  PDF:   'text-red-500 bg-red-500/10 border-red-500/20',
  CSV:   'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  Excel: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
};

interface ActivityItem {
  id: string;
  type: 'report' | 'member' | 'ticket' | 'slot' | 'zone';
  icon: typeof FileText;
  iconBg: string;
  iconColor: string;
  title: string;
  detail: string;
  time: Date;
}

const ACTIVITY_FEED: ActivityItem[] = [
  { id: 'a1',  type: 'report',  icon: FileText,    iconBg: 'bg-blue-500/10',    iconColor: 'text-blue-500',    title: 'Report generated',         detail: 'June Occupancy Report (PDF)',     time: new Date(Date.now() - 2 * 3600000)   },
  { id: 'a2',  type: 'ticket',  icon: Ticket,      iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', title: 'Ticket paid',               detail: 'TKT-01000 · ABC-1234 · රු145.00', time: new Date(Date.now() - 28 * 60000)   },
  { id: 'a3',  type: 'member',  icon: Users,       iconBg: 'bg-violet-500/10',  iconColor: 'text-violet-500',  title: 'Member added',              detail: 'Sarah Chen — Professional plan',  time: new Date(Date.now() - 55 * 60000)   },
  { id: 'a4',  type: 'slot',    icon: Car,         iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-500',   title: 'Slot occupied',             detail: 'A7 · XYZ-9876 entered',          time: new Date(Date.now() - 80 * 60000)   },
  { id: 'a5',  type: 'zone',    icon: BarChart2,   iconBg: 'bg-teal-500/10',    iconColor: 'text-teal-500',    title: 'Zone updated',              detail: 'Zone B rate changed to රු25/hr',   time: new Date(Date.now() - 8 * 3600000)   },
  { id: 'a6',  type: 'member',  icon: Users,       iconBg: 'bg-violet-500/10',  iconColor: 'text-violet-500',  title: 'Member suspended',          detail: 'Tom Nakamura — account paused',   time: new Date(Date.now() - 10 * 3600000)  },
];

function ReportsDashboard({ reports, onViewReports }: {
  reports: Report[];
  onViewReports: () => void;
}) {
  const ready      = reports.filter(r => r.status === 'ready').length;
  const generating = reports.filter(r => r.status === 'generating').length;
  const failed     = reports.filter(r => r.status === 'failed').length;
  const totalSizeKb = reports.reduce((s, r) => s + r.sizeKb, 0);

  const recentReports = [...reports]
    .sort((a, b) => toDate(b.generatedAt).getTime() - toDate(a.generatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Reports',  value: reports.length,            Icon: FileText,    color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
          { label: 'Ready',          value: ready,                     Icon: CheckCircle2,color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Generating',     value: generating,                Icon: RefreshCw,   color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
          { label: 'Storage Used',   value: `${(totalSizeKb/1024).toFixed(1)} MB`, Icon: FileDown, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recent Reports</h2>
            <button onClick={onViewReports} className="text-xs text-blue-500 hover:text-blue-400 transition-colors">View all</button>
          </div>
          <div className="divide-y divide-border">
            {recentReports.map(r => {
              const cfg = TYPE_CFG[r.type] ?? TYPE_CFG['Occupancy'];
              const TypeIcon = cfg.Icon;
              const statusCfg = STATUS_CFG[r.status];
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.dateRange}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{timeSince(r.generatedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recent Activity</h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          </div>
          <div className="divide-y divide-border overflow-y-auto max-h-[340px]">
            {ACTIVITY_FEED.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className={`w-7 h-7 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">{timeSince(item.time)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const REPORT_TYPES: ReportType[] = ['Occupancy', 'Revenue', 'Member Activity', 'Tickets', 'Vehicle Log', 'Zone Summary'];
const REPORT_FORMATS: ReportFormat[] = ['PDF', 'CSV', 'Excel'];

function AddReport({ onGenerated }: { onGenerated: (r: Report) => void }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [type, setType]               = useState<ReportType>('Occupancy');
  const [format, setFormat]           = useState<ReportFormat>('PDF');
  const [dateFrom, setDateFrom]       = useState('2026-06-01');
  const [dateTo, setDateTo]           = useState('2026-06-09');
  const [generating, setGenerating]   = useState(false);
  const [done, setDone]               = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Report name is required.';
    if (!dateFrom)    e.dateFrom = 'Start date required.';
    if (!dateTo)      e.dateTo = 'End date required.';
    if (dateFrom && dateTo && dateFrom > dateTo) e.dateTo = 'End date must be after start date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    setGenerating(true);
    try {
      const from = new Date(dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const to   = new Date(dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const saved = await reportService.generateReport({
        name: name.trim(),
        type,
        format,
        dateRange: `${from} - ${to}`,
        generatedBy: 'Admin',
        description: description.trim(),
      });
      onGenerated(saved);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to generate report.' });
    } finally {
      setGenerating(false);
    }
  };

  const typeConfig = TYPE_CFG[type];
  const TypeIcon = typeConfig.Icon;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Report Details</p>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Report Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. June Occupancy Summary"
            className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border transition-colors placeholder:text-muted-foreground text-sm ${errors.name ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the purpose of this report..."
            rows={3}
            className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors placeholder:text-muted-foreground text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Report Type</label>
          <div className="grid grid-cols-3 gap-2">
            {REPORT_TYPES.map(t => {
              const cfg = TYPE_CFG[t];
              const Icon = cfg.Icon;
              const sel = type === t;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left transition-all text-sm ${
                    sel ? `${cfg.bg} ${cfg.color} border-current ring-1 ring-current` : 'border-border bg-background hover:border-blue-500/30'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${sel ? cfg.bg : 'bg-muted'}`}>
                    <Icon className={`w-3.5 h-3.5 ${sel ? cfg.color : 'text-muted-foreground'}`} />
                  </div>
                  <span className="font-medium text-xs leading-snug">{t}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Date Range</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border transition-colors text-sm ${errors.dateFrom ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
            />
            {errors.dateFrom && <p className="mt-1 text-xs text-red-500">{errors.dateFrom}</p>}
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border transition-colors text-sm ${errors.dateTo ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
            />
            {errors.dateTo && <p className="mt-1 text-xs text-red-500">{errors.dateTo}</p>}
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating || done}
        className={`w-full py-3 rounded-xl font-medium transition-all text-white flex items-center justify-center gap-2 ${
          done       ? 'bg-emerald-500' :
          generating ? 'bg-blue-600/70 cursor-not-allowed' :
                       'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {done ? (
          <><CheckCircle2 className="w-4 h-4" />Report Added!</>
        ) : generating ? (
          <><RefreshCw className="w-4 h-4 animate-spin" />Adding Report...</>
        ) : (
          <><Plus className="w-4 h-4" />Add Report</>
        )}
      </button>
    </div>
  );
}

function ReportDetailModal({ report, onClose, onToggleFixed, onDelete, onDownload, hasAdminReports }: {
  report: Report;
  onClose: () => void;
  onToggleFixed: () => void;
  onDelete: () => void;
  onDownload: () => void;
  hasAdminReports: boolean;
}) {
  const cfg       = TYPE_CFG[report.type] ?? TYPE_CFG['Occupancy'];
  const TypeIcon  = cfg.Icon;
  const statusCfg = STATUS_CFG[report.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className={`w-5 h-5 ${cfg.color}`} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{report.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{report.type} &middot; by {report.generatedBy}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-background border border-border rounded-xl p-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date Range</p>
              <p className="text-sm font-medium">{report.dateRange}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Generated</p>
              <p className="text-sm font-medium">{fmtDate(report.generatedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Format</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${FORMAT_COLORS[report.format as ReportFormat] ?? ''}`}>{report.format}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">File Status</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>{statusCfg.label}</span>
            </div>
            {report.sizeKb > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Size</p>
                <p className="text-sm">{report.sizeKb} KB</p>
              </div>
            )}
          </div>

          {report.description && (
            <div className="bg-background border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{report.description}</p>
            </div>
          )}

          <div className={`rounded-xl border p-4 flex items-start gap-3 ${
            report.fixed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
          }`}>
            {report.fixed
              ? <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              : <CircleDot className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            }
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${report.fixed ? 'text-emerald-500' : 'text-amber-500'}`}>
                {report.fixed ? 'Marked as Fixed' : 'Not Yet Fixed'}
              </p>
              {report.fixed && report.fixedAt && report.fixedBy ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fixed by <span className="font-medium">{report.fixedBy}</span> &middot; {fmtDate(report.fixedAt)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">This report has not been resolved yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          {report.status === 'ready' && (
            <button onClick={onDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}
          {hasAdminReports && (
            <>
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button
                onClick={onToggleFixed}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  report.fixed
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {report.fixed
                  ? <><CircleDot className="w-4 h-4" /> Mark as Not Fixed</>
                  : <><ShieldCheck className="w-4 h-4" /> Mark as Fixed</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewReports({ reports, onDelete, onToggleFixed, onDownload, hasAdminReports }: {
  reports: Report[];
  onDelete: (id: string | number) => void;
  onToggleFixed: (id: string | number) => void;
  onDownload: (id: string | number) => void;
  hasAdminReports: boolean;
}) {
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<ReportType | 'all'>('all');
  const [fmtFilter, setFmtFilter]     = useState<ReportFormat | 'all'>('all');
  const [fixedFilter, setFixedFilter] = useState<'all' | 'fixed' | 'open'>('all');
  const [selected, setSelected]       = useState<Report | null>(null);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const q = search.toLowerCase();
      const matchQ     = !search || r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
      const matchType  = typeFilter   === 'all' || r.type === typeFilter;
      const matchFmt   = fmtFilter    === 'all' || r.format === fmtFilter;
      const matchFixed = fixedFilter  === 'all' || (fixedFilter === 'fixed' ? r.fixed : !r.fixed);
      return matchQ && matchType && matchFmt && matchFixed;
    });
  }, [reports, search, typeFilter, fmtFilter, fixedFilter]);

  const fixedCount = reports.filter(r => r.fixed).length;
  const openCount  = reports.filter(r => !r.fixed).length;
  const liveSelected = selected ? reports.find(r => r.id === selected.id) ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as ReportType | 'all')}
          className="bg-card text-sm text-foreground rounded-xl px-3 py-2 border border-border outline-none focus:border-blue-500 transition-colors"
        >
          <option value="all">All Types</option>
          {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: 'all',   label: 'All',       count: reports.length },
            { key: 'open',  label: 'Not Fixed',  count: openCount      },
            { key: 'fixed', label: 'Fixed',      count: fixedCount     },
          ] as { key: 'all' | 'fixed' | 'open'; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFixedFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                fixedFilter === key ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${fixedFilter === key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Report</span>
          <span>Date Range</span>
          <span>Format</span>
          <span>File Status</span>
          <span>Resolution</span>
          <span></span>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-14 text-center">
              <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No reports found.</p>
            </div>
          ) : (
            filtered.map(r => {
              const cfg       = TYPE_CFG[r.type] ?? TYPE_CFG['Occupancy'];
              const TypeIcon  = cfg.Icon;
              const statusCfg = STATUS_CFG[r.status];
              return (
                <div
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/20 cursor-pointer hover-row group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.type} &middot; by {r.generatedBy}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{r.dateRange}</span>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium w-fit ${FORMAT_COLORS[r.format as ReportFormat] ?? ''}`}>
                    {r.format}
                  </span>

                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium w-fit ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                    {statusCfg.label}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium w-fit ${
                    r.fixed
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {r.fixed
                      ? <><ShieldCheck className="w-3 h-3" />Fixed</>
                      : <><CircleDot className="w-3 h-3" />Open</>
                    }
                  </span>

                  {hasAdminReports && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button
                        title={r.fixed ? 'Mark as Not Fixed' : 'Mark as Fixed'}
                        onClick={() => onToggleFixed(r.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          r.fixed
                            ? 'hover:bg-amber-500/10 text-emerald-500 hover:text-amber-500'
                            : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDelete(r.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground bg-muted/10 flex items-center justify-between">
            <span>{filtered.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}</span>
            <span>{fixedCount} fixed &middot; {openCount} open</span>
          </div>
        )}
      </div>

      {liveSelected && (
        <ReportDetailModal
          report={liveSelected}
          onClose={() => setSelected(null)}
          onToggleFixed={() => onToggleFixed(liveSelected.id)}
          onDelete={() => onDelete(liveSelected.id)}
          onDownload={() => onDownload(liveSelected.id)}
          hasAdminReports={hasAdminReports}
        />
      )}
    </div>
  );
}

export function ReportsView({ subView, hasAdminReports }: { subView: 'dashboard' | 'add' | 'view'; hasAdminReports?: boolean }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportService.fetchReports()
      .then(setReports)
      .catch(() => {
        toast.error('Failed to load reports');
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const addReport = (r: Report) => {
    setReports(prev => [{ ...r }, ...prev]);
  };

  const deleteReport = async (id: string | number) => {
    const r = reports.find(x => x.id === id);
    try {
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(x => x.id !== id));
      if (r) toast.error('Report deleted', { description: `"${r.name}" has been removed.` });
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to delete report.' });
    }
  };

  const toggleFixed = async (id: string | number) => {
    try {
      const updated = await reportService.toggleFixed(id);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to update report.' });
    }
  };

  const downloadReport = async (id: string | number) => {
    try {
      const result: DownloadResult = await reportService.downloadReport(id);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to download report.' });
    }
  };

  const [internalView, setInternalView] = useState<'dashboard' | 'add' | 'view'>(subView);

  useEffect(() => { setInternalView(subView); }, [subView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex justify-end">
        <button
          onClick={() => setInternalView('add')}
          className={`flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors ${internalView === 'add' ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <Plus className="w-4 h-4" />
          Add Report
        </button>
      </div>

      {internalView === 'dashboard' && (
        <ReportsDashboard
          reports={reports}
          onViewReports={() => setInternalView('view')}
        />
      )}
      {internalView === 'add' && (
        <AddReport onGenerated={r => { addReport(r); setInternalView('view'); }} />
      )}
      {internalView === 'view' && (
        <ViewReports reports={reports} onDelete={deleteReport} onToggleFixed={toggleFixed} onDownload={downloadReport} hasAdminReports={hasAdminReports ?? false} />
      )}
    </div>
  );
}
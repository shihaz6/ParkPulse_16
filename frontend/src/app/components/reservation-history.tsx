import { useState, useMemo, useEffect } from 'react';
import { BookMarked, Search, X, Users, Shield, Calendar, Clock, MapPin, Car, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { reservationService, Reservation as BackendReservation } from '../reservationService';

type ReservationType = 'member' | 'staff';
type ReservationStatus = 'active' | 'completed' | 'cancelled';

interface Reservation {
  id: string;
  slotId: string;
  zone: string;
  reservedFor: string;
  reservedForEmail: string;
  type: ReservationType;
  reservedAt: Date;
  startTime: Date;
  endTime?: Date;
  status: ReservationStatus;
  plate?: string;
  vehicleType?: string;
}

function mapReservation(r: BackendReservation): Reservation {
  let status: ReservationStatus = 'active';
  if (r.status === 'COMPLETED') status = 'completed';
  else if (r.status === 'CANCELLED') status = 'cancelled';
  let zone = 'Unknown';
  if (r.slotId) {
    const match = r.slotId.match(/^([A-Za-z]+)/);
    if (match) zone = 'Zone ' + match[1].toUpperCase();
  }
  const reservedAt = r.reservedAt ? new Date(r.reservedAt) : new Date();
  const startTime = r.entryTime ? new Date(r.entryTime) : reservedAt;
  const endTime = r.exitTime ? new Date(r.exitTime) : undefined;
  return {
    id: r.id,
    slotId: r.slotId || '',
    zone,
    reservedFor: r.reservedFor || '',
    reservedForEmail: r.reservedForEmail || '',
    type: r.reservedForType === 'staff' ? 'staff' : 'member',
    reservedAt,
    startTime,
    endTime,
    status,
    plate: r.plate,
    vehicleType: r.vehicleType,
  };
}

const STATUS_CFG: Record<ReservationStatus, { label: string; color: string; bg: string; border: string; Icon: typeof CheckCircle2 }> = {
  active:    { label: 'Active',     color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    Icon: BookMarked   },
  completed: { label: 'Completed',  color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',  color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: XCircle      },
};

function timeSince(d: Date) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

function fmtDateTime(d: Date) {
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function duration(start: Date, end?: Date) {
  const ms = (end ?? new Date()).getTime() - start.getTime();
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

export function ReservationHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<ReservationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await reservationService.fetchReservations();
      const mapped = (data || []).map(mapReservation);
      setReservations(mapped);
    } catch (err: any) {
      toast.error('Failed to load history', { description: err.message || 'Could not load reservation history.' });
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const counts = {
    all:       reservations.length,
    active:    reservations.filter(r => r.status === 'active').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    member:    reservations.filter(r => r.type === 'member').length,
    staff:     reservations.filter(r => r.type === 'staff').length,
  };

  const filtered = useMemo(() => {
    return reservations.filter(r => {
      const q = search.toLowerCase();
      const matchQ = !search ||
        r.reservedFor.toLowerCase().includes(q) ||
        r.slotId.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q) ||
        (r.plate ?? '').toLowerCase().includes(q);
      const matchType   = typeFilter   === 'all' || r.type   === typeFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchQ && matchType && matchStatus;
    }).sort((a, b) => b.reservedAt.getTime() - a.reservedAt.getTime());
  }, [reservations, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Reservation History</h3>
          <p className="text-muted-foreground text-sm">All parking slot reservations made by members and staff.</p>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-card hover:bg-muted border border-border rounded-lg text-sm font-medium text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',      value: counts.all,       color: 'text-foreground',    bg: 'bg-muted',           Icon: BookMarked  },
          { label: 'Active',     value: counts.active,    color: 'text-blue-500',      bg: 'bg-blue-500/10',     Icon: BookMarked  },
          { label: 'Completed',  value: counts.completed, color: 'text-emerald-500',   bg: 'bg-emerald-500/10',  Icon: CheckCircle2 },
          { label: 'Cancelled',  value: counts.cancelled, color: 'text-red-500',       bg: 'bg-red-500/10',      Icon: XCircle     },
        ].map(({ label, value, color, bg, Icon }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover-lift">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Name, slot, plate…"
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>

        {/* Type */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: 'all',    label: 'All' },
            { key: 'member', label: 'Members' },
            { key: 'staff',  label: 'Staff' },
          ] as { key: ReservationType | 'all'; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setTypeFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === key ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: 'all',       label: 'All'       },
            { key: 'active',    label: 'Active'    },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ] as { key: ReservationStatus | 'all'; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === key ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Reserved For</span>
          <span>Slot / Zone</span>
          <span>Vehicle</span>
          <span>Duration</span>
          <span>Reserved</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="py-14 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <BookMarked className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No reservations found.</p>
            </div>
          ) : filtered.map(r => {
            const statusCfg = STATUS_CFG[r.status];
            const StatusIcon = statusCfg.Icon;
            return (
              <div key={r.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors hover-row">
                {/* Person */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${r.type === 'member' ? 'bg-violet-600' : 'bg-blue-600'}`}>
                    {r.reservedFor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{r.reservedFor}</p>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${r.type === 'member' ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {r.type === 'member' ? <Users className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                        {r.type === 'member' ? 'Member' : 'Staff'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{r.reservedForEmail || 'No email'}</p>
                  </div>
                </div>

                {/* Slot */}
                <div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {r.slotId}
                  </div>
                  <p className="text-xs text-muted-foreground">{r.zone}</p>
                </div>

                {/* Vehicle */}
                <div>
                  {r.plate ? (
                    <>
                      <div className="flex items-center gap-1 text-xs font-mono font-semibold">
                        <Car className="w-3 h-3 text-muted-foreground" />
                        {r.plate}
                      </div>
                      <p className="text-xs text-muted-foreground">{r.vehicleType}</p>
                    </>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {duration(r.startTime, r.endTime)}
                </div>

                {/* Reserved at */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {timeSince(r.reservedAt)}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">{fmtDateTime(r.reservedAt)}</p>
                </div>

                {/* Status */}
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium w-fit ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusCfg.label}
                </span>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground bg-muted/10 flex justify-between">
            <span>{filtered.length} of {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</span>
            <span>{counts.member} member · {counts.staff} staff</span>
          </div>
        )}
      </div>
    </div>
  );
}
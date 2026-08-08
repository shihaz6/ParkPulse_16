import { useState, useMemo, useEffect } from 'react';
import {
  Ticket, Search, Filter, Clock, Car, MapPin, CheckCircle2,
  AlertTriangle, CircleDot, Printer, X, ChevronDown, Receipt,
  CreditCard, TrendingUp, Calendar, Banknote, ArrowLeft,
  Lock, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ticketService, BackendTicket } from '../ticketService';

// ─── Types ─────────────────────────────────────────────────────────────────

type TicketStatus = 'active' | 'paid' | 'overdue';

interface ParkingTicket {
  id: string;
  plate: string;
  vehicleType: string;
  slot: string;
  zone: string;
  entryTime: Date;
  exitTime?: Date;
  durationMins: number;
  ratePerHour: number;
  status: TicketStatus;
  paidAt?: Date;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapBackendTicket(t: BackendTicket): ParkingTicket {
  const entryTime = new Date(t.entryTime);
  const exitTime = t.exitTime ? new Date(t.exitTime) : undefined;
  const durationMins = t.durationMins ?? (exitTime
    ? Math.round((exitTime.getTime() - entryTime.getTime()) / 60000)
    : Math.round((Date.now() - entryTime.getTime()) / 60000));

  let status: TicketStatus;
  if (t.status === 'FINISHED') {
    status = 'paid';
  } else {
    status = durationMins > 240 ? 'overdue' : 'active';
  }

  return {
    id: t.id,
    plate: t.vehiclePlate,
    vehicleType: t.vehicleType,
    slot: t.slot,
    zone: t.zone || 'Unknown',
    entryTime,
    exitTime,
    durationMins,
    ratePerHour: t.ratePerHour || 10,
    status,
    paidAt: exitTime,
  };
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function calcAmount(mins: number, rate: number) {
  return Math.max(rate, Math.ceil(mins / 60) * rate);
}

const STATUS_CFG: Record<TicketStatus, { label: string; color: string; bg: string; Icon: typeof CheckCircle2 }> = {
  active:  { label: 'Active',  color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/20',    Icon: CircleDot    },
  paid:    { label: 'Paid',    color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/20',       Icon: AlertTriangle },
};

// ─── Checkout Modal ─────────────────────────────────────────────────────────

type PayMethod = 'card' | 'cash';

function formatCardNum(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExp(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function CheckoutModal({ ticket, currencySymbol, onClose, onPaid }: {
  ticket: ParkingTicket;
  currencySymbol: string;
  onClose: () => void;
  onPaid: () => void;
}) {
  const amount = calcAmount(ticket.durationMins, ticket.ratePerHour);
  const [method, setMethod]     = useState<PayMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess]   = useState(false);

  // Card state
  const [cardNum, setCardNum]   = useState('');
  const [expiry, setExpiry]     = useState('');
  const [cvv, setCvv]           = useState('');
  const [holder, setHolder]     = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Cash state
  const [tendered, setTendered] = useState('');
  const tenderedNum = parseFloat(tendered) || 0;
  const change = Math.max(0, tenderedNum - amount);
  const cashValid = tenderedNum >= amount;

  const detectCard = (n: string) => {
    const raw = n.replace(/\s/g, '');
    if (/^4/.test(raw)) return 'VISA';
    if (/^5[1-5]/.test(raw)) return 'Mastercard';
    if (/^3[47]/.test(raw)) return 'Amex';
    return null;
  };

  const validateCard = () => {
    const e: Record<string, string> = {};
    if (!holder.trim())                          e.holder = 'Name on card is required.';
    if (cardNum.replace(/\s/g, '').length < 13)  e.number = 'Enter a valid card number.';
    if (!/^\d{2}\/\d{2}$/.test(expiry))          e.expiry = 'Use MM/YY format.';
    if (cvv.length < 3)                          e.cvv    = 'Enter a valid CVV.';
    setCardErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (method === 'card' && !validateCard()) return;
    if (method === 'cash' && !cashValid) return;
    setProcessing(true);
    try {
      await ticketService.checkoutTicket(ticket.id, method);
      setProcessing(false);
      setSuccess(true);
      toast.success('Payment successful!', { description: `${ticket.id} · ${ticket.plate}` });
      setTimeout(() => { onPaid(); onClose(); }, 1400);
    } catch (err: unknown) {
      setProcessing(false);
      toast.error('Checkout failed', { description: err instanceof Error ? err.message : '' });
    }
  };

  const cardType = detectCard(cardNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center gap-3 flex-shrink-0">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">Checkout</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{ticket.id} · {ticket.plate}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {success ? (
            <div className="flex flex-col items-center py-10 gap-4 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-lg">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">{currencySymbol}{amount.toFixed(2)} collected via {method === 'card' ? 'Card' : 'Cash'}.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Customer & ticket summary */}
              <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Ticket Summary</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground mb-0.5">Plate</p><p className="font-mono font-semibold">{ticket.plate}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Vehicle</p><p>{ticket.vehicleType}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Slot / Zone</p><p>{ticket.slot} · {ticket.zone}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Duration</p><p>{fmtDuration(ticket.durationMins)}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Rate</p><p>{currencySymbol}{ticket.ratePerHour}/hr</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Total Due</p>
                    <p className={`font-bold text-base ${ticket.status === 'overdue' ? 'text-red-500' : 'text-foreground'}`}>
                      {currencySymbol}{amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment method tabs */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'card', label: 'Pay by Card',  Icon: CreditCard, color: 'blue'  },
                    { key: 'cash', label: 'Pay by Cash',  Icon: Banknote,   color: 'emerald' },
                  ] as { key: PayMethod; label: string; Icon: typeof CreditCard; color: string }[]).map(({ key, label, Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => setMethod(key)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                        method === key
                          ? `bg-${color}-500/10 border-${color}-500/30 ring-1 ring-${color}-500/20`
                          : 'border-border hover:border-blue-500/30 bg-background'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${method === key ? `bg-${color}-500/10` : 'bg-muted'}`}>
                        <Icon className={`w-5 h-5 ${method === key ? `text-${color}-500` : 'text-muted-foreground'}`} />
                      </div>
                      <span className={`font-medium text-sm ${method === key ? `text-${color}-500` : 'text-foreground'}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Card form ── */}
              {method === 'card' && (
                <div className="bg-background border border-border rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-white/80" />
                      <span className="text-white/80 text-sm font-medium">Card Details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cardType && <span className="text-white font-bold text-sm tracking-widest">{cardType}</span>}
                      <Lock className="w-4 h-4 text-white/60" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Card Number</label>
                      <input value={cardNum} onChange={e => setCardNum(formatCardNum(e.target.value))}
                        placeholder="0000 0000 0000 0000" maxLength={19}
                        className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${cardErrors.number ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                      {cardErrors.number && <p className="mt-1 text-xs text-red-500">{cardErrors.number}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Cardholder Name</label>
                      <input value={holder} onChange={e => setHolder(e.target.value.toUpperCase())}
                        placeholder="NAME ON CARD"
                        className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm uppercase tracking-wide placeholder:normal-case placeholder:text-muted-foreground transition-colors ${cardErrors.holder ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                      {cardErrors.holder && <p className="mt-1 text-xs text-red-500">{cardErrors.holder}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1.5">Expiry Date</label>
                        <input value={expiry} onChange={e => setExpiry(formatExp(e.target.value))}
                          placeholder="MM/YY" maxLength={5}
                          className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${cardErrors.expiry ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                        {cardErrors.expiry && <p className="mt-1 text-xs text-red-500">{cardErrors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1.5">CVV</label>
                        <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••" type="password" maxLength={4}
                          className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${cardErrors.cvv ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                        {cardErrors.cvv && <p className="mt-1 text-xs text-red-500">{cardErrors.cvv}</p>}
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <Lock className="w-3 h-3" /> Your payment is encrypted and processed securely.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Cash form ── */}
              {method === 'cash' && (
                <div className="bg-background border border-border rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <Banknote className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Cash Payment</p>
                      <p className="text-xs text-muted-foreground">Enter the amount tendered by the customer.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Amount Due</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl border border-border">
                      <span className="text-sm font-medium text-muted-foreground">{currencySymbol}</span>
                      <span className="text-lg font-bold">{amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Amount Tendered <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">{currencySymbol}</span>
                      <input
                        type="number" step="0.01" min={amount} value={tendered}
                        onChange={e => setTendered(e.target.value)}
                        placeholder={amount.toFixed(2)}
                        className={`w-full bg-card text-foreground rounded-xl pl-9 pr-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${!cashValid && tendered ? 'border-red-500' : 'border-border focus:border-emerald-500'}`}
                      />
                    </div>
                    {!cashValid && tendered && (
                      <p className="mt-1 text-xs text-red-500">Amount tendered must be at least {currencySymbol}{amount.toFixed(2)}.</p>
                    )}
                  </div>
                  {cashValid && tendered && (
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${change > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                      <span className="text-sm text-muted-foreground">Change to return</span>
                      <span className={`text-lg font-bold ${change > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {currencySymbol}{change.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
            <button
              onClick={handleConfirm}
              disabled={processing || (method === 'cash' && !cashValid)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-all btn-glow ${
                processing ? 'bg-blue-600/70 cursor-not-allowed' :
                method === 'cash' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {processing
                ? <><RefreshCw className="w-4 h-4 animate-spin" />Processing…</>
                : method === 'card'
                ? <><CreditCard className="w-4 h-4" />Confirm Payment · {currencySymbol}{amount.toFixed(2)}</>
                : <><Banknote className="w-4 h-4" />Confirm Cash Payment · {currencySymbol}{amount.toFixed(2)}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ticket Detail Modal ────────────────────────────────────────────────────

function TicketModal({ ticket, currencySymbol, onClose, onMarkPaid }: {
  ticket: ParkingTicket;
  currencySymbol: string;
  onClose: () => void;
  onMarkPaid: (id: string) => void;
}) {
  const cfg = STATUS_CFG[ticket.status];
  const amount = calcAmount(ticket.durationMins, ticket.ratePerHour);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">{ticket.id}</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Vehicle info */}
          <div className="bg-background rounded-xl border border-border p-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Plate Number</p>
              <p className="font-mono font-semibold">{ticket.plate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vehicle Type</p>
              <p>{ticket.vehicleType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Slot</p>
              <p className="font-medium">{ticket.slot}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Zone</p>
              <p>{ticket.zone}</p>
            </div>
          </div>

          {/* Time info */}
          <div className="bg-background rounded-xl border border-border p-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Entry Time</p>
              <p>{fmtDate(ticket.entryTime)} {fmtTime(ticket.entryTime)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Exit Time</p>
              <p>{ticket.exitTime ? `${fmtDate(ticket.exitTime)} ${fmtTime(ticket.exitTime)}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">{fmtDuration(ticket.durationMins)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rate / Hour</p>
              <p>{currencySymbol}{ticket.ratePerHour.toFixed(2)}</p>
            </div>
          </div>

          {/* Amount */}
          <div className={`rounded-xl border p-4 flex items-center justify-between ${ticket.status === 'overdue' ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
              <p className={`text-2xl font-bold ${ticket.status === 'overdue' ? 'text-red-500' : 'text-foreground'}`}>
                {currencySymbol}{amount.toFixed(2)}
              </p>
            </div>
            {ticket.status === 'paid' && ticket.paidAt && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Paid At</p>
                <p className="text-sm text-emerald-500 font-medium">{fmtDate(ticket.paidAt)} {fmtTime(ticket.paidAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          {ticket.status !== 'paid' && (
            <button
              onClick={() => { onClose(); onMarkPaid(ticket.id); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Proceed to Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main View ──────────────────────────────────────────────────────────────

export function TicketsView({ currencySymbol }: { currencySymbol: string }) {
  const [tickets, setTickets] = useState<ParkingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected]   = useState<ParkingTicket | null>(null);
  const [checkout, setCheckout]   = useState<ParkingTicket | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'amount' | 'duration'>('time');

  useEffect(() => {
    setLoading(true);
    ticketService.fetchTickets()
      .then(data => setTickets((data || []).map(mapBackendTicket)))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  const markPaid = async (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    setCheckout(ticket);
  };

  const handlePaid = (id: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, status: 'paid' as TicketStatus, exitTime: new Date(), paidAt: new Date() };
    }));
  };

  const filtered = useMemo(() => {
    let list = tickets;
    if (filter !== 'all') list = list.filter(t => t.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.plate.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.slot.toLowerCase().includes(q) ||
        t.zone.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'amount')   return calcAmount(b.durationMins, b.ratePerHour) - calcAmount(a.durationMins, a.ratePerHour);
      if (sortBy === 'duration') return b.durationMins - a.durationMins;
      return b.entryTime.getTime() - a.entryTime.getTime();
    });
  }, [tickets, filter, search, sortBy]);

  const counts = {
    all:     tickets.length,
    active:  tickets.filter(t => t.status === 'active').length,
    paid:    tickets.filter(t => t.status === 'paid').length,
    overdue: tickets.filter(t => t.status === 'overdue').length,
  };

  const totalRevenue = tickets.filter(t => t.status === 'paid').reduce((s, t) => s + calcAmount(t.durationMins, t.ratePerHour), 0);
  const pendingRevenue = tickets.filter(t => t.status !== 'paid').reduce((s, t) => s + calcAmount(t.durationMins, t.ratePerHour), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Plate, ticket ID, slot…"
              className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-44"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Sort */}
          <div className="relative flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent outline-none cursor-pointer text-foreground appearance-none pr-5"
            >
              <option value="time">Newest first</option>
              <option value="amount">Highest amount</option>
              <option value="duration">Longest stay</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none" />
          </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets',    value: counts.all,                              Icon: Ticket,      color: 'text-blue-500',    bg: 'bg-blue-500/10' },
          { label: 'Active',           value: counts.active,                           Icon: CircleDot,   color: 'text-blue-400',    bg: 'bg-blue-400/10' },
          { label: 'Collected',        value: `${currencySymbol}${totalRevenue.toFixed(2)}`,   Icon: Receipt,     color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pending Revenue',  value: `${currencySymbol}${pendingRevenue.toFixed(2)}`, Icon: TrendingUp,  color: 'text-amber-500',   bg: 'bg-amber-500/10' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover-lift">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">
        {([
          { key: 'all',     label: 'All' },
          { key: 'active',  label: 'Active' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'paid',    label: 'Paid' },
        ] as { key: 'all' | TicketStatus; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Ticket / Vehicle</span>
          <span>Slot & Zone</span>
          <span>Entry Time</span>
          <span>Duration</span>
          <span>Amount</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Ticket className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No tickets found.</p>
            </div>
          ) : (
            filtered.map(ticket => {
              const cfg = STATUS_CFG[ticket.status];
              const amount = calcAmount(ticket.durationMins, ticket.ratePerHour);
              const StatusIcon = cfg.Icon;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/20 cursor-pointer hover-row"
                >
                  {/* Ticket + vehicle */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      ticket.status === 'overdue' ? 'bg-red-500/10' :
                      ticket.status === 'paid'    ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Ticket className={`w-4 h-4 ${
                        ticket.status === 'overdue' ? 'text-red-500' :
                        ticket.status === 'paid'    ? 'text-emerald-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{ticket.id}</p>
                      <p className="font-mono font-semibold truncate">{ticket.plate}</p>
                      <p className="text-xs text-muted-foreground">{ticket.vehicleType}</p>
                    </div>
                  </div>

                  {/* Slot & zone */}
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Car className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{ticket.slot}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{ticket.zone}</span>
                    </div>
                  </div>

                  {/* Entry time */}
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{fmtDate(ticket.entryTime)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{fmtTime(ticket.entryTime)}</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{fmtDuration(ticket.durationMins)}</span>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className={`font-bold ${ticket.status === 'overdue' ? 'text-red-500' : ''}`}>
                      {currencySymbol}{amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{currencySymbol}{ticket.ratePerHour}/hr</p>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2">
                    {ticket.status !== 'paid' && (
                      <button
                        onClick={e => { e.stopPropagation(); setCheckout(ticket); }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-medium transition-colors whitespace-nowrap"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground bg-muted/10">
            Showing {filtered.length} of {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <TicketModal
          ticket={selected}
          currencySymbol={currencySymbol}
          onClose={() => setSelected(null)}
          onMarkPaid={(id) => { setSelected(null); setCheckout(tickets.find(t => t.id === id) ?? null); }}
        />
      )}

      {checkout && (
        <CheckoutModal
          ticket={checkout}
          currencySymbol={currencySymbol}
          onClose={() => setCheckout(null)}
          onPaid={() => handlePaid(checkout.id)}
        />
      )}
    </div>
  );
}

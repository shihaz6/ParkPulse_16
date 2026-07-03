import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster, toast } from 'sonner';
import {
  LayoutDashboard, Circle, BarChart3, Users, Settings, Sun, Moon,
  Plus, User, Clock, ChevronDown, ChevronRight,
  Globe, Shield, Activity, Eye, EyeOff, ArrowRight, Lock,
  AtSign, CheckCircle2, TrendingUp, ParkingSquare, Menu, LogOut,
  UserPlus, KeyRound, Pencil, Trash2, ShieldCheck, ShieldOff,
  CreditCard, Crown, Tag, Package, X, UserCheck, Camera, AlertTriangle, Ticket, FileText, BookMarked, RefreshCw,
} from 'lucide-react';
import { AnalyticsSection } from './components/analytics-section';
import { ParkingSlotsView } from './components/parking-slots-view';
import { TicketsView } from './components/tickets-view';
import { MembersView } from './components/members-view';
import { ReportsView } from './components/reports-view';
import { AIChatWidget } from './components/ai-chat-widget';
import { StaffView } from './components/staff-view';
import { ReservationHistory } from './components/reservation-history';
import { login as apiLogin, logout as authLogout } from './authService';
import { memberService } from './memberService';
import { staffService } from './staffService';
import { settingsService } from './settingsService';
import { profileService } from './profileService';
import { zoneService } from './zoneService';
import { parkingService } from './parkingService';
import { TIMEZONE_OPTIONS, CURRENCY_OPTIONS } from './types';

function LoginPage({
  onLogin,
  darkMode,
  onToggleTheme,
  plans,
}: {
  onLogin: (user: string, role: string, access?: string, permissions?: string[]) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  plans: MembershipPlan[];
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1400);
    return () => clearInterval(t);
  }, []);

  const slotStates = Array.from({ length: 30 }, (_, i) => {
    const seed = (i * 7 + tick * 3) % 11;
    return seed < 4;
  });
  const occupied = slotStates.filter(Boolean).length;
  const occupancyPct = Math.round((occupied / slotStates.length) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    apiLogin(username, password)
      .then((data) => {
        setLoading(false);
        toast.success(`Welcome back, ${data.username}!`);
        onLogin(data.username, data.role, data.access, data.permissions);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || 'Invalid username or password.');
      });
  };

  return (
    <>
    <div className="h-screen w-full flex bg-background text-foreground relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-200px] right-[-100px] w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] px-14 py-10 relative z-10 border-r border-border overflow-y-auto login-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Activity className="w-5 h-5 text-white" />
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold tracking-tight">ParkPulse</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Operator Console</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs text-muted-foreground">All systems live</span>
          </div>
        </div>

        {/* Live preview card */}
        <div className="relative mt-4">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-xl dark:shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2 ml-auto">
                <span className="text-3xl font-bold tabular-nums">{occupancyPct}%</span>
                <span className="text-sm text-muted-foreground">occupancy</span>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-1.5 mb-5">
              {slotStates.map((occ, i) => (
                <div
                  key={i}
                  className={`h-7 rounded-md transition-all duration-700 ${
                    occ
                      ? 'bg-red-500/80 shadow-[0_0_12px_-2px_rgba(239,68,68,0.6)]'
                      : 'bg-emerald-500/70 shadow-[0_0_12px_-2px_rgba(16,185,129,0.5)]'
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Available</div>
                <div className="text-xl font-semibold text-emerald-500 tabular-nums">{slotStates.length - occupied}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Occupied</div>
                <div className="text-xl font-semibold text-red-500 tabular-nums">{occupied}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-lg">
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight mb-4">
              Real-time parking,
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">zero guesswork.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Monitor occupancy, track revenue, and orchestrate every slot from one intelligent console.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {['Live telemetry', 'Smart routing', 'Revenue ops'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm text-muted-foreground bg-muted border border-border">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
          <span>© 2026 ParkPulse · v4.2</span>
          <div className="flex items-center gap-5">
            <a className="hover:text-foreground transition-colors" href="#">Privacy</a>
            <a className="hover:text-foreground transition-colors" href="#">Terms</a>
            <a className="hover:text-foreground transition-colors" href="#">Status</a>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10 overflow-y-auto login-scrollbar">
        {/* Theme toggle top-right */}
        <button
          onClick={onToggleTheme}
          className="absolute top-6 right-6 w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-full max-w-[460px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ParkPulse</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs mb-6">
            <TrendingUp className="w-3 h-3" />
            <span>Q2 release · faster live feed</span>
          </div>

          <h1 className="text-[3rem] font-bold mb-3 tracking-tight leading-tight">Welcome back.</h1>
          <p className="text-muted-foreground mb-10 text-base">Sign in to manage your facility.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Username</label>
              <div className="relative group">
                <AtSign className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full bg-muted text-foreground rounded-xl pl-11 pr-4 py-4 outline-none border border-border focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Password</label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-muted text-foreground rounded-xl pl-11 pr-12 py-4 outline-none border border-border focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" className="accent-blue-600 w-4 h-4 rounded" />
                Remember me
              </label>
              <button type="button" className="text-blue-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25 text-white flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New to ParkPulse?</span>
            <button
              onClick={() => setRequestOpen(true)}
              className="text-blue-500 hover:text-blue-400 transition-colors font-medium"
            >
              Request access →
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Request Access Modal */}
    {requestOpen && <RequestAccessModal onClose={() => setRequestOpen(false)} />}
    </>
  );
}

const VEHICLE_TYPE_OPTIONS = ['Sedan', 'SUV', 'EV', 'Motorcycle', 'Truck', 'Coupe', 'Van', 'Accessible'];

function genUsername(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
}
function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function fmtCardNumReq(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function fmtExpiryReq(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

const PLAN_COLORS_REQ: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/30',    accent: 'bg-blue-500'    },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', accent: 'bg-emerald-500' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-500',  border: 'border-violet-500/30',  accent: 'bg-violet-500'  },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/30',   accent: 'bg-amber-500'   },
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-500',  border: 'border-indigo-500/30',  accent: 'bg-indigo-500'  },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-500',    border: 'border-rose-500/30',    accent: 'bg-rose-500'    },
};

function RequestAccessModal({ onClose }: { onClose: () => void }) {
  type Step = 1 | 2 | 3 | 4 | 5 | 6;
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', plate: '', vehicleType: 'Sedan' });
  const set = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch plans from backend when modal opens (public endpoint, no auth needed)
  const [availablePlans, setAvailablePlans] = useState<MembershipPlan[]>([]);
  useEffect(() => {
    memberService.fetchPlans()
      .then(setAvailablePlans)
      .catch(() => {});
  }, []);

  // Plan selection
  const [billing, setBilling]         = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Card
  const [cardNum, setCardNum]   = useState('');
  const [expiry, setExpiry]     = useState('');
  const [cvv, setCvv]           = useState('');
  const [holder, setHolder]     = useState('');
  const [processing, setProcessing] = useState(false);

  // Generated credentials
  const [credentials] = useState(() => ({ username: genUsername(''), password: genPassword() }));
  const [finalCreds, setFinalCreds] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const STEPS = ['Personal Info', 'Vehicle Details', 'Confirm', 'Choose Plan', 'Checkout', 'Welcome'];
  const TOTAL = 5; // steps 1-5 shown in indicator; step 6 = success screen

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = 'Full name is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address.';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.plate.trim()) e.plate = 'Vehicle plate number is required.';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const validateStep4 = () => {
    const e: Record<string, string> = {};
    if (!selectedPlan) e.plan = 'Please select a plan.';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const validateStep5 = () => {
    const e: Record<string, string> = {};
    if (!holder.trim())                         e.holder = 'Cardholder name is required.';
    if (cardNum.replace(/\s/g, '').length < 13) e.number = 'Enter a valid card number.';
    if (!/^\d{2}\/\d{2}$/.test(expiry))         e.expiry = 'Use MM/YY format.';
    if (cvv.length < 3)                         e.cvv    = 'Enter a valid CVV.';
    setErrors(e); 
    return Object.keys(e).length === 0;
  };

  const validateStep5WithBackend = async () => {
    if (!validateStep5()) return false;
    
    try {
      const result = await memberService.validateCard({
        holder,
        number: cardNum,
        expiry,
        cvv
      });
      if (!result.valid) {
        setErrors({ number: result.message || 'Invalid card details' });
        return false;
      }
      return true;
    } catch (err: any) {
      setErrors({ number: err.message || 'Validation failed' });
      return false;
    }
  };

  const goNext = async () => {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 4 && !validateStep4()) return;
    if (step === 5) {
      const valid = await validateStep5WithBackend();
      if (!valid) return;
      setProcessing(true);
      try {
        const username = genUsername(form.name);
        const password = genPassword();
        await memberService.createMember({
          name: form.name,
          email: form.email,
          phone: form.phone,
          username,
          password,
          plan: selectedPlan,
          vehicles: 1,
          status: 'active',
          joined: new Date().toISOString(),
        } as Member);
        setProcessing(false);
        setFinalCreds({ username, password });
        setStep(6);
      } catch (err: any) {
        setProcessing(false);
        toast.error('Registration failed', { description: err.message });
      }
      return;
    }
    setStep(s => (s + 1) as Step);
  };
  const goBack = () => { setErrors({}); setStep(s => (s - 1) as Step); };

  const detectCard = (n: string) => {
    const r = n.replace(/\s/g, '');
    if (/^4/.test(r)) return 'VISA';
    if (/^5[1-5]/.test(r)) return 'Mastercard';
    if (/^3[47]/.test(r)) return 'Amex';
    return null;
  };

  const activePlans = availablePlans.filter(p => p.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold">Request Access</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step < 6 ? `Step ${step} of 5 — ${STEPS[step - 1]}` : 'Account Created Successfully'}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator (steps 1–5) */}
        {step < 6 && (
          <div className="px-6 pt-4 flex items-center gap-1.5">
            {STEPS.slice(0, TOTAL).map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const current = step === n;
              return (
                <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                    done ? 'bg-emerald-500 text-white' : current ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {done ? <CheckCircle2 className="w-3 h-3" /> : n}
                  </div>
                  <span className={`text-[10px] truncate hidden sm:block ${current ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                  {i < TOTAL - 1 && <div className={`h-px flex-1 mx-1 ${step > n ? 'bg-emerald-500' : 'bg-border'}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. Sarah Fernando"
                  className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.name ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium flex-shrink-0">
                    <span className="text-base leading-none">🇱🇰</span>
                    <span className="text-muted-foreground">+94</span>
                  </div>
                  <input value={form.phone} onChange={e => set({ phone: e.target.value.replace(/\D/g, '').slice(0, 9) })} placeholder="77 000 0000"
                    className={`flex-1 bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.phone ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input value={form.email} onChange={e => set({ email: e.target.value })} placeholder="e.g. sarah@email.com" type="email"
                  className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.email ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </>
          )}

          {/* ── STEP 2: Vehicle Details ── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Vehicle Number Plate <span className="text-red-500">*</span></label>
                <input value={form.plate} onChange={e => set({ plate: e.target.value.toUpperCase() })} placeholder="e.g. ABC-1234"
                  className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm font-mono transition-colors placeholder:text-muted-foreground ${errors.plate ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                {errors.plate && <p className="mt-1 text-xs text-red-500">{errors.plate}</p>}
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Vehicle Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {VEHICLE_TYPE_OPTIONS.map(vt => (
                    <button key={vt} onClick={() => set({ vehicleType: vt })}
                      className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${form.vehicleType === vt ? 'bg-blue-600 border-blue-600 text-white' : 'border-border bg-background text-muted-foreground hover:border-blue-500/40 hover:text-foreground'}`}>
                      {vt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <>
              <div className="bg-background border border-border rounded-xl p-4 space-y-2.5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Personal</p>
                {[['Name', form.name], ['Phone', `+94 ${form.phone}`], ['Email', form.email]].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span><span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-background border border-border rounded-xl p-4 space-y-2.5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Vehicle</p>
                {[['Plate', form.plate], ['Type', form.vehicleType]].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span><span className="font-medium font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Confirm your details, then choose a membership plan.</p>
            </>
          )}

          {/* ── STEP 4: Choose Plan ── */}
          {step === 4 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Select a membership plan</p>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 border border-border">
                  {(['monthly', 'annual'] as const).map(c => (
                    <button key={c} onClick={() => setBilling(c)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${billing === c ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                      {c}{c === 'annual' && <span className="ml-1 text-emerald-500">−20%</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {activePlans.map(plan => {
                  const col = PLAN_COLORS_REQ[plan.color] ?? PLAN_COLORS_REQ['blue'];
                  const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
                  const sel = selectedPlan === plan.name;
                  return (
                    <button key={plan.id} onClick={() => setSelectedPlan(plan.name)}
                      className={`flex flex-col gap-2 px-4 py-4 rounded-xl border text-left transition-all ${sel ? `${col.bg} ${col.border} ring-1 ring-current` : 'border-border bg-background hover:border-blue-500/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className={`w-7 h-7 rounded-lg ${sel ? col.bg : 'bg-muted'} flex items-center justify-center`}>
                          <CreditCard className={`w-3.5 h-3.5 ${sel ? col.text : 'text-muted-foreground'}`} />
                        </div>
                        {sel && <CheckCircle2 className={`w-4 h-4 ${col.text}`} />}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${sel ? col.text : ''}`}>{plan.name}</p>
                        <p className={`text-lg font-bold mt-0.5 ${sel ? col.text : 'text-foreground'}`}>
                          රු{parseFloat(price).toFixed(2)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plan.maxVehicles === 'unlimited' ? 'Unlimited' : plan.maxVehicles} vehicle{plan.maxVehicles !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.plan && <p className="text-xs text-red-500">{errors.plan}</p>}
            </>
          )}

          {/* ── STEP 5: Checkout ── */}
          {step === 5 && (
            <>
              {/* Order summary */}
              <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Selected Plan</p>
                  <p className="font-semibold">{selectedPlan}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{billing === 'monthly' ? 'Monthly' : 'Annual'}</p>
                  <p className="font-bold text-blue-500">
                    රු{parseFloat((availablePlans.find(p => p.name === selectedPlan)?.[billing === 'monthly' ? 'monthlyPrice' : 'annualPrice'] ?? '0')).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Card form */}
              <div className="bg-background border border-border rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">Card Details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {detectCard(cardNum) && <span className="text-white font-bold text-sm tracking-widest">{detectCard(cardNum)}</span>}
                    <Lock className="w-4 h-4 text-white/60" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Card Number</label>
                    <input value={cardNum} onChange={e => setCardNum(fmtCardNumReq(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19}
                      className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${errors.number ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                    {errors.number && <p className="mt-1 text-xs text-red-500">{errors.number}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Cardholder Name</label>
                    <input value={holder} onChange={e => setHolder(e.target.value.toUpperCase())} placeholder="NAME ON CARD"
                      className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm uppercase tracking-wide placeholder:normal-case placeholder:text-muted-foreground transition-colors ${errors.holder ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                    {errors.holder && <p className="mt-1 text-xs text-red-500">{errors.holder}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Expiry</label>
                      <input value={expiry} onChange={e => setExpiry(fmtExpiryReq(e.target.value))} placeholder="MM/YY" maxLength={5}
                        className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${errors.expiry ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                      {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">CVV</label>
                      <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" type="password" maxLength={4}
                        className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${errors.cvv ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                      {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 6: Welcome + credentials ── */}
          {step === 6 && (
            <div className="flex flex-col items-center py-4 gap-5 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-xl">Welcome to ParkPulse!</p>
                <p className="text-sm text-muted-foreground mt-1">Your account is ready. Save your login credentials below.</p>
              </div>

              <div className="w-full bg-background border border-border rounded-2xl overflow-hidden text-left">
                <div className="px-4 py-3 border-b border-border bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Your Credentials</p>
                </div>
                <div className="p-4 space-y-4">
                  {/* Username */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Username</p>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl">
                      <AtSign className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="font-mono font-semibold text-sm flex-1">{finalCreds.username}</span>
                    </div>
                  </div>
                  {/* Password */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Temporary Password</p>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl">
                      <Lock className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span className="font-mono font-semibold text-sm flex-1 tracking-widest">
                        {showPwd ? finalCreds.password : '•'.repeat(finalCreds.password.length)}
                      </span>
                      <button onClick={() => setShowPwd(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-600 dark:text-amber-400">Save these credentials now. You will be prompted to change your password on first login.</p>
                  </div>
                </div>
              </div>

              <div className="w-full flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer (steps 1–5 only) */}
        {step < 6 && (
          <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
            {step > 1 ? (
              <button onClick={goBack} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Back</button>
            ) : (
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
            )}

            {step < 5 ? (
              <button onClick={goNext}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                {step === 3 ? 'Confirm & Choose Plan' : 'Continue'} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-medium transition-colors"
              >
                {processing
                  ? <><RefreshCw className="w-4 h-4 animate-spin" />Processing…</>
                  : <><CheckCircle2 className="w-4 h-4" />Pay & Create Account</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GeneralSettings({ darkMode, onToggleDarkMode, currency, onCurrencyChange, autoRefresh, onToggleAutoRefresh }: {
  darkMode: boolean; onToggleDarkMode: () => void;
  currency: string; onCurrencyChange: (v: string) => void;
  autoRefresh: boolean; onToggleAutoRefresh: () => void;
}) {
  const [facilityName, setFacilityName] = useState('ParkPulse Main Lot');
  const [timezone, setTimezone] = useState('UTC-05:00');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on mount (NOT including darkMode - that's controlled by user's theme toggle)
  useEffect(() => {
    settingsService.fetchGeneral()
      .then(data => {
        setFacilityName(data.facilityName || 'ParkPulse Main Lot');
        setTimezone(data.timezone || 'UTC-05:00');
        // Don't overwrite autoRefresh here - it's controlled via parent prop
        onCurrencyChange(data.currency || 'lkr');
      })
      .catch(err => console.error('Failed to load general settings:', err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateGeneral({
        facilityName,
        timezone,
        currency,
        darkMode,
        autoRefresh,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">General Settings</h3>
        <p className="text-muted-foreground text-sm">Manage your facility preferences and display options.</p>
      </div>
      <div className="bg-card rounded-2xl p-6 space-y-5 border border-border">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Facility Name</label>
          <input value={facilityName} onChange={e => setFacilityName(e.target.value)} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Timezone</label>
          <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors">
            {TIMEZONE_OPTIONS.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Currency</label>
          <select value={currency} onChange={e => onCurrencyChange(e.target.value)} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors">
            {CURRENCY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Dark Mode</div>
            <div className="text-xs text-muted-foreground">Use dark theme across the dashboard</div>
          </div>
          <Toggle on={darkMode} onToggle={onToggleDarkMode} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Auto-refresh Dashboard</div>
            <div className="text-xs text-muted-foreground">Refresh live feed every 30 seconds</div>
          </div>
          <Toggle on={autoRefresh} onToggle={onToggleAutoRefresh} />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}

const SESSION_TIMEOUT_OPTIONS = [
  { value: '5m',    label: '5 minutes',  desc: 'Very strict — high security' },
  { value: '15m',   label: '15 minutes', desc: 'Recommended for shared devices' },
  { value: '30m',   label: '30 minutes', desc: 'Balanced security & convenience' },
  { value: '1h',    label: '1 hour',     desc: 'Suitable for personal devices' },
  { value: 'never', label: 'Never',      desc: 'Stay signed in indefinitely' },
];

function SessionTimeoutDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = SESSION_TIMEOUT_OPTIONS.find(o => o.value === value) ?? SESSION_TIMEOUT_OPTIONS[2];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all min-w-[180px] justify-between ${
          open ? 'border-blue-500/60 ring-4 ring-blue-500/10 bg-background' : 'border-border bg-background hover:border-blue-500/40'
        } text-foreground`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${value === 'never' ? 'bg-gray-400' : 'bg-blue-500'}`} />
          <span>{selected.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 bg-card border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Timeout after inactivity</span>
          </div>
          <div className="p-1.5 space-y-0.5">
            {SESSION_TIMEOUT_OPTIONS.map(opt => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    active ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-blue-600/15' : 'bg-muted'}`}>
                    <Clock className={`w-3.5 h-3.5 ${active ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${active ? 'text-blue-600' : ''}`}>{opt.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">{opt.desc}</div>
                  </div>
                  {active && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const MAX_ATTEMPT_OPTIONS = [
  { value: '3',         label: '3 attempts',   desc: 'Most strict' },
  { value: '5',         label: '5 attempts',   desc: 'Recommended' },
  { value: '10',        label: '10 attempts',  desc: 'Lenient' },
  { value: 'unlimited', label: 'Unlimited',    desc: 'No limit' },
];

const LOCKOUT_OPTIONS = [
  { value: '5m',         label: '5 minutes',   desc: 'Quick recovery' },
  { value: '15m',        label: '15 minutes',  desc: 'Recommended' },
  { value: '30m',        label: '30 minutes',  desc: 'Strong deterrent' },
  { value: '1h',         label: '1 hour',      desc: 'Very strict' },
  { value: 'permanent',  label: 'Permanent',   desc: 'Manual unlock required' },
];

function AttemptDropdown({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: typeof MAX_ATTEMPT_OPTIONS }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) ?? options[0];
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all min-w-[160px] justify-between ${open ? 'border-blue-500/60 ring-4 ring-blue-500/10 bg-background' : 'border-border bg-background hover:border-blue-500/40'} text-foreground`}>
        <span>{selected.label}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-card border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
          <div className="p-1.5 space-y-0.5">
            {options.map(opt => {
              const active = opt.value === value;
              return (
                <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${active ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-muted text-foreground'}`}>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${active ? 'text-blue-600' : ''}`}>{opt.label}</div>
                    <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                  </div>
                  {active && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SecuritySettings() {
  const [timeout, setTimeout] = useState('30m');
  const [limitEnabled, setLimitEnabled] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState('5');
  const [lockoutDuration, setLockoutDuration] = useState('15m');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const settings = await settingsService.fetchSecurity();
        setTimeout(settings.sessionTimeout);
        setLimitEnabled(settings.limitEnabled);
        setMaxAttempts(settings.maxFailedAttempts);
        setLockoutDuration(settings.lockoutDuration);
      } catch (err) {
        toast.error('Failed to load security settings');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSecurity({
        sessionTimeout: timeout,
        limitEnabled,
        maxFailedAttempts: maxAttempts,
        lockoutDuration,
      });
      toast.success('Security settings saved');
    } catch (err) {
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Security Settings</h3>
        <p className="text-muted-foreground text-sm">Configure session behaviour and login protection.</p>
      </div>

      {/* Session */}
      <div className="bg-card rounded-2xl p-6 space-y-5 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Session</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Session Timeout</div>
            <div className="text-xs text-muted-foreground">Auto log out after inactivity</div>
          </div>
          <SessionTimeoutDropdown value={timeout} onChange={setTimeout} />
        </div>
      </div>

      {/* Login attempt limiting */}
      <div className="bg-card rounded-2xl p-6 space-y-5 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Login Attempt Limiting</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Enable Attempt Limiting</div>
            <div className="text-xs text-muted-foreground">Lock accounts after too many failed logins</div>
          </div>
          <Toggle on={limitEnabled} onToggle={() => setLimitEnabled(v => !v)} />
        </div>

        {limitEnabled && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Max Failed Attempts</div>
                <div className="text-xs text-muted-foreground">Before account is locked</div>
              </div>
              <AttemptDropdown value={maxAttempts} onChange={setMaxAttempts} options={MAX_ATTEMPT_OPTIONS} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Lockout Duration</div>
                <div className="text-xs text-muted-foreground">How long the account stays locked</div>
              </div>
              <AttemptDropdown value={lockoutDuration} onChange={setLockoutDuration} options={LOCKOUT_OPTIONS} />
            </div>
            {lockoutDuration === 'permanent' && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">Permanently locked accounts must be manually unlocked by an Admin in Access Control.</p>
              </div>
            )}
          </>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}


interface Zone {
  id: string;
  name: string;
  prefix: string;
  totalSlots: number;
  reservedSlots: number;
  ratePerHour: string;
  rateType: string;
  vehicleTypes: string[];
  overflowAlert: boolean;
  autoRelease: boolean;
  releaseTimeout: string;
  color: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const ZONE_COLORS = [
  { label: 'Blue',   value: 'blue',   bg: 'bg-blue-500',    ring: 'ring-blue-500',    text: 'text-blue-500',    bar: 'bg-blue-500' },
  { label: 'Green',  value: 'green',  bg: 'bg-emerald-500', ring: 'ring-emerald-500', text: 'text-emerald-500', bar: 'bg-emerald-500' },
  { label: 'Purple', value: 'purple', bg: 'bg-purple-500',  ring: 'ring-purple-500',  text: 'text-purple-500',  bar: 'bg-purple-500' },
  { label: 'Orange', value: 'orange', bg: 'bg-orange-500',  ring: 'ring-orange-500',  text: 'text-orange-500',  bar: 'bg-orange-500' },
  { label: 'Pink',   value: 'pink',   bg: 'bg-pink-500',    ring: 'ring-pink-500',    text: 'text-pink-500',    bar: 'bg-pink-500' },
  { label: 'Teal',   value: 'teal',   bg: 'bg-teal-500',    ring: 'ring-teal-500',    text: 'text-teal-500',    bar: 'bg-teal-500' },
];

const VEHICLE_TYPES = ['Car', 'SUV', 'Sedan', 'Coupe', 'Motorcycle', 'Truck', 'EV', 'Accessible'];
const RATE_TYPES = ['Flat hourly rate', 'Tiered (first hour premium)', 'Daily cap'];

const DEFAULT_ZONES: Zone[] = [
  { id: 'z1', name: 'Zone A — General', prefix: 'A', totalSlots: 20, reservedSlots: 2,  ratePerHour: '10.00', rateType: 'Flat hourly rate', vehicleTypes: ['Car', 'EV'],       overflowAlert: true,  autoRelease: false, releaseTimeout: '120', color: 'blue',   status: 'active' },
  { id: 'z2', name: 'Zone B — VIP',     prefix: 'B', totalSlots: 8,  reservedSlots: 8,  ratePerHour: '25.00', rateType: 'Flat hourly rate', vehicleTypes: ['Car'],             overflowAlert: true,  autoRelease: false, releaseTimeout: '120', color: 'purple', status: 'active' },
  { id: 'z3', name: 'Zone C — Bikes',   prefix: 'C', totalSlots: 6,  reservedSlots: 0,  ratePerHour: '4.00',  rateType: 'Flat hourly rate', vehicleTypes: ['Motorcycle'],      overflowAlert: false, autoRelease: true,  releaseTimeout: '60',  color: 'green',  status: 'active' },
];

let _zoneTempCounter = 0;
function blankZone(): Zone {
  return { id: 'new_' + Date.now() + '_' + (++_zoneTempCounter), name: '', prefix: '', totalSlots: 10, reservedSlots: 0, ratePerHour: '10.00', rateType: 'Flat hourly rate', vehicleTypes: ['Car'], overflowAlert: true, autoRelease: false, releaseTimeout: '120', color: 'blue', status: 'active' };
}

function colorFor(value: string) {
  return ZONE_COLORS.find(c => c.value === value) ?? ZONE_COLORS[0];
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${on ? 'bg-blue-600' : 'bg-muted border border-border'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${on ? 'right-1 bg-white' : 'left-1 bg-muted-foreground'}`} />
    </div>
  );
}

function ZoneForm({ initial, onSave, onCancel, isNew, currencySymbol }: {
  initial: Zone;
  onSave: (z: Zone) => void;
  onCancel: () => void;
  isNew: boolean;
  currencySymbol: string;
}) {
  const [form, setForm] = useState<Zone>(initial);
  const set = (patch: Partial<Zone>) => setForm(prev => ({ ...prev, ...patch }));
  const toggleVehicle = (v: string) => {
    set({ vehicleTypes: form.vehicleTypes.includes(v) ? form.vehicleTypes.filter(x => x !== v) : [...form.vehicleTypes, v] });
  };
  const col = colorFor(form.color);

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Identity</div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'active',      label: 'Active',           dot: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500/40 bg-emerald-500/10' },
              { value: 'inactive',    label: 'Inactive',         dot: 'bg-gray-400',    text: 'text-gray-400',    ring: 'ring-gray-400/40 bg-gray-400/10' },
              { value: 'maintenance', label: 'Under Maintenance', dot: 'bg-amber-500',   text: 'text-amber-500',   ring: 'ring-amber-500/40 bg-amber-500/10' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set({ status: opt.value })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  form.status === opt.value
                    ? `ring-2 ${opt.ring} border-transparent ${opt.text}`
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Zone Name</label>
          <input
            value={form.name}
            onChange={e => set({ name: e.target.value })}
            placeholder="e.g. Zone A — General"
            className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Slot ID Prefix</label>
          <input
            value={form.prefix}
            maxLength={4}
            onChange={e => set({ prefix: e.target.value })}
            placeholder="e.g. A, VIP, B2"
            className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground"
          />
          {form.prefix && <p className="text-xs text-muted-foreground mt-1.5">Slots labelled {form.prefix}1, {form.prefix}2 …</p>}
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Zone Colour</label>
          <div className="flex gap-2">
            {ZONE_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => set({ color: c.value })}
                className={`w-8 h-8 rounded-full ${c.bg} transition-all ${form.color === c.value ? `ring-2 ring-white/70 scale-110` : 'opacity-55 hover:opacity-80'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Slots</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Total Slots</label>
            <input type="number" min={1} max={500} value={form.totalSlots} onChange={e => set({ totalSlots: Number(e.target.value) })} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors tabular-nums" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Reserved Slots</label>
            <input type="number" min={0} max={form.totalSlots} value={form.reservedSlots} onChange={e => set({ reservedSlots: Number(e.target.value) })} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors tabular-nums" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Pricing</div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Hourly Rate ({currencySymbol})</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
            <input type="number" min={0} step={0.5} value={form.ratePerHour} onChange={e => set({ ratePerHour: e.target.value })} className="w-full bg-background text-foreground rounded-lg pl-8 pr-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors tabular-nums" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Rate Type</label>
          <select value={form.rateType} onChange={e => set({ rateType: e.target.value })} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors">
            {RATE_TYPES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Vehicle Types */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Allowed Vehicle Types</div>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_TYPES.map(v => {
            const active = form.vehicleTypes.includes(v);
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggleVehicle(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${active ? `${col.bar} border-transparent text-white` : 'bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'}`}
              >
                {v}
              </button>
            );
          })}
        </div>
        {form.vehicleTypes.length === 0 && <p className="text-xs text-red-500">Select at least one vehicle type.</p>}
      </div>

      {/* Behaviour */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Behaviour</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Overflow Alert</div>
            <div className="text-xs text-muted-foreground">Warn when zone exceeds 90% capacity</div>
          </div>
          <Toggle on={form.overflowAlert} onToggle={() => set({ overflowAlert: !form.overflowAlert })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Auto-release Stale Slots</div>
            <div className="text-xs text-muted-foreground">Free slots automatically after timeout</div>
          </div>
          <Toggle on={form.autoRelease} onToggle={() => set({ autoRelease: !form.autoRelease })} />
        </div>
        {form.autoRelease && (
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Release Timeout (minutes)</label>
            <input type="number" min={10} value={form.releaseTimeout} onChange={e => set({ releaseTimeout: e.target.value })} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors tabular-nums" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pb-2">
        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || !form.prefix.trim() || form.vehicleTypes.length === 0}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-white"
        >
          {isNew ? 'Create Zone' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="px-6 py-3 bg-muted hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ParkingSlotSettings({ currencySymbol, zones, setZones }: {
  currencySymbol: string;
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
}) {
  const [mode, setMode] = useState<'list' | 'edit' | 'create' | 'defaults'>('list');
  const [editing, setEditing] = useState<Zone | null>(null);
  const [defaults, setDefaults] = useState<ZoneSettings | null>(null);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [savingDefaults, setSavingDefaults] = useState(false);

  const openCreate = () => { setEditing(blankZone()); setMode('create'); };
  const openEdit = (z: Zone) => { setEditing({ ...z }); setMode('edit'); };
  const openDefaults = async () => {
    setMode('defaults');
    setLoadingDefaults(true);
    try {
      const data = await settingsService.fetchZoneSettings();
      setDefaults(data);
    } catch (err) {
      console.error('Failed to load zone defaults:', err);
    } finally {
      setLoadingDefaults(false);
    }
  };
  const cancel = () => { setMode('list'); setEditing(null); };

  const save = async (z: Zone) => {
    try {
      if (mode === 'create') {
        // Omit id — let the backend generate a real UUID
        const { id: _tmpId, ...rest } = z;
        const zoneToSave = {
          ...rest,
          ratePerHour: parseFloat(z.ratePerHour as any) || 0,
        } as Zone;
        const saved = await zoneService.saveZone(zoneToSave);
        // Convert back to frontend format
        const frontendZone = {
          ...saved,
          ratePerHour: String(saved.ratePerHour),
          status: saved.status as 'active' | 'inactive' | 'maintenance',
        } as Zone;
        setZones(prev => [...prev, frontendZone]);
        toast.success('Zone created');
      } else {
        const zoneToSave = {
          ...z,
          ratePerHour: parseFloat(z.ratePerHour as any) || 0,
        };
        const saved = await zoneService.updateZone(z.id, zoneToSave);
        const frontendZone = {
          ...saved,
          ratePerHour: String(saved.ratePerHour),
          status: saved.status as 'active' | 'inactive' | 'maintenance',
        } as Zone;
        setZones(prev => prev.map(existing => existing.id === z.id ? frontendZone : existing));
        toast.success('Zone updated');
      }
      setMode('list');
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save zone');
    }
  };

  const deleteZone = async (id: string) => {
    try {
      await zoneService.deleteZone(id);
      setZones(prev => prev.filter(z => z.id !== id));
      toast.success('Zone deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete zone');
    }
  };

  if (mode === 'defaults') {
    if (loadingDefaults) {
      return (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (!defaults) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Zone Defaults</h3>
              <p className="text-muted-foreground text-sm">Configure default values for new zones.</p>
            </div>
            <button onClick={cancel} className="px-4 py-2.5 bg-muted hover:bg-accent rounded-lg text-sm font-medium">Back to Zones</button>
          </div>
          <div className="text-center text-muted-foreground py-8">Failed to load zone defaults</div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Zone Defaults</h3>
            <p className="text-muted-foreground text-sm">Configure default values for new zones.</p>
          </div>
          <button onClick={cancel} className="px-4 py-2.5 bg-muted hover:bg-accent rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground">Back to Zones</button>
        </div>
        <div className="bg-card rounded-2xl p-6 space-y-5 border border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Total Slots</label>
              <input type="number" value={defaults.defaultTotalSlots} onChange={e => setDefaults({...defaults, defaultTotalSlots: parseInt(e.target.value) || 10})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="1" max="1000" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Reserved Slots</label>
              <input type="number" value={defaults.defaultReservedSlots} onChange={e => setDefaults({...defaults, defaultReservedSlots: parseInt(e.target.value) || 0})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="0" max="1000" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Rate Per Hour</label>
              <input type="number" step="0.01" value={defaults.defaultRatePerHour} onChange={e => setDefaults({...defaults, defaultRatePerHour: parseFloat(e.target.value) || 10})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="0" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Rate Type</label>
              <select value={defaults.defaultRateType} onChange={e => setDefaults({...defaults, defaultRateType: e.target.value})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors">
                <option value="Flat hourly rate">Flat hourly rate</option>
                <option value="Tiered (first hour premium)">Tiered (first hour premium)</option>
                <option value="Daily cap">Daily cap</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Color</label>
              <select value={defaults.defaultColor} onChange={e => setDefaults({...defaults, defaultColor: e.target.value})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors">
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
                <option value="pink">Pink</option>
                <option value="teal">Teal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Status</label>
              <select value={defaults.defaultStatus} onChange={e => setDefaults({...defaults, defaultStatus: e.target.value})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Default Overflow Alert</div>
              <div className="text-xs text-muted-foreground">Notify when zone reaches capacity</div>
            </div>
            <input type="checkbox" checked={defaults.defaultOverflowAlert} onChange={e => setDefaults({...defaults, defaultOverflowAlert: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Default Auto Release</div>
              <div className="text-xs text-muted-foreground">Automatically release slot after timeout</div>
            </div>
            <input type="checkbox" checked={defaults.defaultAutoRelease} onChange={e => setDefaults({...defaults, defaultAutoRelease: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Release Timeout (minutes)</label>
              <input type="number" value={defaults.defaultReleaseTimeout} onChange={e => setDefaults({...defaults, defaultReleaseTimeout: parseInt(e.target.value) || 120})} className="w-32 bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="1" max="1440" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Default Allowed Vehicle Types</label>
              <select value={defaults.defaultVehicleTypes[0]} onChange={e => setDefaults({...defaults, defaultVehicleTypes: [e.target.value]})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors">
                <option value="Car">Car</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Coupe">Coupe</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
                <option value="EV">EV</option>
                <option value="Accessible">Accessible</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button onClick={cancel} className="px-4 py-2.5 bg-muted hover:bg-accent rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={saveDefaults} disabled={savingDefaults} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white disabled:opacity-50">
            {savingDefaults ? 'Saving...' : 'Save Defaults'}
          </button>
        </div>
      </div>
    );
  }

  if (mode !== 'list' && editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={cancel} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Zones
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-foreground">{mode === 'create' ? 'New Zone' : editing.name}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{mode === 'create' ? 'Create Zone' : 'Edit Zone'}</h3>
          <p className="text-muted-foreground text-sm">{mode === 'create' ? 'Define a new parking zone and its rules.' : "Update this zone's configuration."}</p>
        </div>
        <ZoneForm initial={editing} onSave={save} onCancel={cancel} isNew={mode === 'create'} currencySymbol={currencySymbol} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Slot Settings</h3>
          <p className="text-muted-foreground text-sm">Manage zones, pricing, and allowed vehicle types.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openDefaults}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium text-white transition-colors flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
            Zone Defaults
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Zone
          </button>
        </div>
      </div>

      {zones.length === 0 && (
        <div className="bg-card rounded-2xl p-12 flex flex-col items-center text-center gap-3 border border-border">
          <ParkingSquare className="w-10 h-10 text-muted-foreground" />
          <div className="text-muted-foreground text-sm">No zones configured yet.<br />Create your first zone to get started.</div>
          <button onClick={openCreate} className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors">
            Create Zone
          </button>
        </div>
      )}

      <div className="space-y-3">
        {zones.map(zone => {
          const col = colorFor(zone.color);
          return (
            <div
              key={zone.id}
              onClick={() => openEdit(zone)}
              className="group bg-card hover:bg-muted rounded-2xl p-5 cursor-pointer transition-colors border border-border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${col.bg}`} />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{zone.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Prefix: {zone.prefix} · {zone.totalSlots} slots · {currencySymbol}{zone.ratePerHour}/hr</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); deleteZone(zone.id); }}
                    className="opacity-0 group-hover:opacity-100 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs transition-all"
                  >
                    Delete
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {zone.status !== 'active' && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                    zone.status === 'maintenance'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-gray-400/10 text-gray-400 border-gray-400/20'
                  }`}>
                    {zone.status === 'maintenance' ? 'Under Maintenance' : 'Inactive'}
                  </span>
                )}
                {zone.vehicleTypes.filter(Boolean).map(v => (
                  <span key={v} className={`text-[11px] px-2 py-0.5 rounded-full bg-muted ${col.text} border border-border`}>{v}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Access Control ──────────────────────────────────────────────────────────

type AccessLevel = 'admin' | 'manager' | 'operator' | 'viewer' | 'custom';

const CUSTOM_PERMISSION_GROUPS = [
  {
    group: 'General',
    items: [
      { id: 'dashboard',         label: 'Dashboard',          desc: 'View the main overview dashboard' },
      { id: 'analytics',         label: 'Analytics',          desc: 'Access analytics and charts' },
      { id: 'reports-admin',     label: 'Reports - Admin',    desc: 'Full access to manage all reports' },
      { id: 'reports-staff',     label: 'Reports - Staff',    desc: 'Add reports and view responses' },
      { id: 'tickets',           label: 'Tickets',            desc: 'View and manage support tickets' },
    ],
  },
  {
    group: 'Management',
    items: [
      { id: 'member-management', label: 'Member Management',  desc: 'Manage memberships and members' },
      { id: 'staff-management',  label: 'Staff Management',   desc: 'Add and edit staff accounts' },
      { id: 'parking-slots',     label: 'Parking Slots',      desc: 'Control and configure parking slots' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { id: 'settings-general',        label: 'General Settings',  desc: 'Edit facility name, timezone and display options' },
      { id: 'settings-security',       label: 'Security Settings', desc: 'Configure session timeout and login attempt limits' },
      { id: 'settings-parking-slots',  label: 'Slot Settings',     desc: 'Manage zones, pricing and vehicle rules' },
      { id: 'settings-access-control', label: 'Access Control',    desc: 'Add and edit staff access levels' },
      { id: 'settings-profile',        label: 'Profile',           desc: 'Edit display name, email and profile photo' },
      { id: 'settings-password',       label: 'Security',          desc: 'Change account password' },
    ],
  },
] as const;

const CUSTOM_PERMISSIONS = CUSTOM_PERMISSION_GROUPS.flatMap(g => g.items);

type PermissionId = typeof CUSTOM_PERMISSIONS[number]['id'];

interface StaffMember {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  role: string;
  access: AccessLevel;
  permissions: PermissionId[];
  active: boolean;
  hasVehicle?: boolean;
  vehiclePlate?: string;
  vehicleType?: string;
  vehicleMake?: string;
  vehicleColor?: string;
  password?: string;
}

const ACCESS_LEVELS: { value: AccessLevel; label: string; desc: string; color: string; bg: string }[] = [
  { value: 'admin',    label: 'Admin',    desc: 'Full system access',              color: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/30' },
  { value: 'manager',  label: 'Manager',  desc: 'Manage zones & view reports',     color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/30' },
  { value: 'operator', label: 'Operator', desc: 'Toggle slots & view dashboard',   color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30' },
  { value: 'viewer',   label: 'Viewer',   desc: 'Read-only access',                color: 'text-gray-400',    bg: 'bg-gray-400/10 border-gray-400/30' },
  { value: 'custom',   label: 'Custom',   desc: 'Pick individual permissions',     color: 'text-violet-500',  bg: 'bg-violet-500/10 border-violet-500/30' },
];

const DEFAULT_STAFF: StaffMember[] = [
  { id: 's1', name: 'Alex Morgan',   username: 'alex.morgan',   email: 'alex@parkpulse.io',    phone: '+94 77 100 0001', dob: '1988-04-12', gender: 'Male',   role: 'Facility Manager',  access: 'admin',    permissions: [],                                                          active: true,  hasVehicle: true,  vehiclePlate: 'MGR-0001', vehicleType: 'SUV',      vehicleMake: 'Toyota Fortuner', vehicleColor: 'Black'  },
  { id: 's2', name: 'Jordan Lee',    username: 'jordan.lee',    email: 'jordan@parkpulse.io',  phone: '+94 77 100 0002', dob: '1991-08-25', gender: 'Female', role: 'Operations Lead',   access: 'manager',  permissions: [],                                                          active: true,  hasVehicle: true,  vehiclePlate: 'OPS-0002', vehicleType: 'Sedan',    vehicleMake: 'Honda Civic',     vehicleColor: 'White'  },
  { id: 's3', name: 'Casey Rivera',  username: 'casey.r',       email: 'casey@parkpulse.io',   phone: '+94 77 100 0003', dob: '1995-02-14', gender: 'Other',  role: 'Shift Operator',    access: 'operator', permissions: [],                                                          active: true,  hasVehicle: false },
  { id: 's4', name: 'Taylor Smith',  username: 'taylor.smith',  email: 'taylor@parkpulse.io',  phone: '+94 77 100 0004', dob: '1993-11-30', gender: 'Male',   role: 'Security Guard',    access: 'operator', permissions: [],                                                          active: false, hasVehicle: true,  vehiclePlate: 'OPR-0004', vehicleType: 'Motorcycle', vehicleMake: 'Bajaj Pulsar',   vehicleColor: 'Red'    },
  { id: 's5', name: 'Morgan Blake',  username: 'morgan.b',      email: 'morgan@parkpulse.io',  phone: '+94 77 100 0005', dob: '1990-07-07', gender: 'Female', role: 'Analyst',           access: 'custom',   permissions: ['dashboard', 'analytics', 'reports-staff', 'tickets'],  active: true,  hasVehicle: true,  vehiclePlate: 'CST-0005', vehicleType: 'EV',       vehicleMake: 'Tesla Model 3',   vehicleColor: 'Silver' },
];

function accessLevel(value: AccessLevel) {
  return ACCESS_LEVELS.find(l => l.value === value) ?? ACCESS_LEVELS[3];
}

function blankStaff(): StaffMember {
  return { id: '', name: '', username: '', email: '', phone: '', dob: '', gender: '', role: '', access: 'operator', permissions: [], active: true, hasVehicle: false, vehiclePlate: '', vehicleType: '', vehicleMake: '', vehicleColor: '', password: '' };
}

function StaffForm({ initial, onSave, onCancel, isNew }: {
  initial: StaffMember;
  onSave: (s: StaffMember) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<StaffMember>(initial);
  const set = (patch: Partial<StaffMember>) => setForm(prev => ({ ...prev, ...patch }));

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Staff Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Full Name</label>
            <input
              value={form.name}
              onChange={e => set({ name: e.target.value })}
              placeholder="e.g. Jordan Lee"
              className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Job Title / Role</label>
            <input
              value={form.role}
              onChange={e => set({ role: e.target.value })}
              placeholder="e.g. Shift Operator"
              className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set({ email: e.target.value })}
            placeholder="e.g. jordan@company.com"
            className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Account Active</div>
            <div className="text-xs text-muted-foreground">Allow this staff member to sign in</div>
          </div>
          <div
            onClick={() => set({ active: !form.active })}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${form.active ? 'bg-blue-600' : 'bg-muted border border-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${form.active ? 'right-1 bg-white' : 'left-1 bg-muted-foreground'}`} />
          </div>
        </div>
      </div>

      {/* Access level */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Access Level</div>
        <div className="grid grid-cols-2 gap-3">
          {ACCESS_LEVELS.map(lvl => (
            <button
              key={lvl.value}
              type="button"
              onClick={() => set({ access: lvl.value })}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                form.access === lvl.value ? `${lvl.bg} border-current` : 'border-border hover:bg-muted'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${form.access === lvl.value ? lvl.bg : 'bg-muted'}`}>
                {lvl.value === 'admin'    && <ShieldCheck className={`w-4 h-4 ${form.access === lvl.value ? lvl.color : 'text-muted-foreground'}`} />}
                {lvl.value === 'manager'  && <Shield     className={`w-4 h-4 ${form.access === lvl.value ? lvl.color : 'text-muted-foreground'}`} />}
                {lvl.value === 'operator' && <KeyRound   className={`w-4 h-4 ${form.access === lvl.value ? lvl.color : 'text-muted-foreground'}`} />}
                {lvl.value === 'viewer'   && <Eye        className={`w-4 h-4 ${form.access === lvl.value ? lvl.color : 'text-muted-foreground'}`} />}
                {lvl.value === 'custom'   && <Pencil     className={`w-4 h-4 ${form.access === lvl.value ? lvl.color : 'text-muted-foreground'}`} />}
              </div>
              <div>
                <div className={`text-sm font-semibold ${form.access === lvl.value ? lvl.color : 'text-foreground'}`}>{lvl.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{lvl.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom permissions */}
        {form.access !== 'admin' && (
          <div className="mt-2 rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-violet-500/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Custom Permissions</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => set({ permissions: CUSTOM_PERMISSIONS.map(p => p.id) as PermissionId[] })}
                  className="text-xs text-violet-500 hover:text-violet-400 transition-colors"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => set({ permissions: [] })}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div>
              {CUSTOM_PERMISSION_GROUPS.map((group, gi) => {
                const groupIds = group.items.map(p => p.id) as PermissionId[];
                const allChecked = groupIds.every(id => form.permissions.includes(id));
                const someChecked = groupIds.some(id => form.permissions.includes(id));
                return (
                  <div key={group.group} className={gi > 0 ? 'border-t border-violet-500/10' : ''}>
                    {/* Group header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-violet-500/5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">{group.group}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = allChecked
                            ? form.permissions.filter(p => !groupIds.includes(p))
                            : [...form.permissions.filter(p => !groupIds.includes(p)), ...groupIds];
                          set({ permissions: next as PermissionId[] });
                        }}
                        className="text-[11px] text-violet-500 hover:text-violet-400 transition-colors"
                      >
                        {allChecked ? 'Deselect group' : someChecked ? 'Select all' : 'Select all'}
                      </button>
                    </div>
                    {/* Items */}
                    <div className="divide-y divide-violet-500/10">
                      {group.items.map(perm => {
                        const checked = form.permissions.includes(perm.id as PermissionId);
                        return (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-violet-500/5 transition-colors"
                          >
                            <div className="relative flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked
                                    ? form.permissions.filter(p => p !== perm.id)
                                    : [...form.permissions, perm.id as PermissionId];
                                  set({ permissions: next as PermissionId[] });
                                }}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                checked ? 'bg-violet-500 border-violet-500' : 'border-border bg-background'
                              }`}>
                                {checked && (
                                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{perm.label}</div>
                              <div className="text-xs text-muted-foreground">{perm.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {form.permissions.length === 0 && (
              <p className="px-4 py-2.5 text-xs text-amber-500 border-t border-violet-500/10">
                No permissions selected — this staff member will have no access.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || !form.email.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-white"
        >
          {isNew ? 'Add Staff Member' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="px-6 py-3 bg-muted hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  plate: string;
  vehicleType: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'declined';
}

const DEFAULT_ACCESS_REQUESTS: AccessRequest[] = [
  { id: 'req1', name: 'Tempos',        email: 'tempos@email.com',   phone: '+94 77 123 4567', plate: 'TMP-0001', vehicleType: 'Sedan',      requestedAt: new Date(Date.now() - 2 * 3600000),  status: 'pending' },
  { id: 'req2', name: 'Kavya Nair',    email: 'kavya@email.com',    phone: '+94 76 234 5678', plate: 'KVN-8821', vehicleType: 'SUV',        requestedAt: new Date(Date.now() - 5 * 3600000),  status: 'pending' },
  { id: 'req3', name: 'Ravi Perera',   email: 'ravi@email.com',     phone: '+94 71 345 6789', plate: 'RVP-3345', vehicleType: 'Motorcycle', requestedAt: new Date(Date.now() - 24 * 3600000), status: 'pending' },
];

function AccessControl({ staff, setStaff }: { staff: StaffMember[]; setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>> }) {
  const [mode, setMode] = useState<'list' | 'edit' | 'create' | 'access-settings'>('list');
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [filter, setFilter] = useState<AccessLevel | 'all'>('all');
  const [requests, setRequests] = useState<AccessRequest[]>(DEFAULT_ACCESS_REQUESTS);
  const [approvingReq, setApprovingReq] = useState<AccessRequest | null>(null);
  const [approveAccess, setApproveAccess] = useState<AccessLevel>('operator');
  const [accessSettings, setAccessSettings] = useState<AccessControlSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const openAccessSettings = async () => {
    setMode('access-settings');
    setLoadingSettings(true);
    try {
      const data = await settingsService.fetchAccessControl();
      setAccessSettings(data);
    } catch (err) {
      console.error('Failed to load access control settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveAccessSettings = async () => {
    if (!accessSettings) return;
    setSavingSettings(true);
    try {
      await settingsService.updateAccessControl(accessSettings);
      toast.success('Access control settings saved');
      setMode('list');
    } catch (err) {
      toast.error('Failed to save access control settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const cancelSettings = () => { setMode('list'); };

  const save = async (s: StaffMember) => {
    try {
      const staffData = {
        id: s.id,
        name: s.name,
        role: s.role,
        email: s.email,
        username: s.username,
        password: s.password || undefined,
        access: s.access,
        active: s.active,
        customPermissions: s.permissions,
        phone: s.phone,
        joinDate: s.dob,
        address: '',
        vehicleNumber: s.vehiclePlate,
        vehicleType: s.vehicleType,
        shift: '',
        status: s.active ? 'Active' : 'Inactive',
      };

      if (mode === 'create') {
        const saved = await staffService.saveStaff(staffData);
        const newStaff: StaffMember = { ...s, id: saved.id, avatar: saved.avatar };
        setStaff(prev => [...prev, newStaff]);
        toast.success('Staff member added', { description: `${s.name} (@${s.username}) added as ${levelFor(s.access).label}.` });
      } else {
        const saved = await staffService.updateStaff(s.id, staffData);
        const updatedStaff: StaffMember = { ...s, avatar: saved.avatar };
        setStaff(prev => prev.map(m => m.id === s.id ? updatedStaff : m));
        toast.success('Staff member updated', { description: `${s.name}'s details have been saved.` });
      }
      setMode('list');
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save staff member');
    }
  };

  const remove = async (id: string) => {
    try {
      const m = staff.find(s => s.id === id);
      await staffService.deleteStaff(id);
      setStaff(prev => prev.filter(s => s.id !== id));
      if (m) toast.error('Staff member removed', { description: `${m.name} has been deleted.` });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete staff member');
    }
  };

  const openEdit = (s: StaffMember) => { setEditing({ ...s }); setMode('edit'); };
  const cancel = () => { setMode('list'); setEditing(null); };

  const toggleActive = async (id: string) => {
    try {
      const member = staff.find(s => s.id === id);
      if (!member) return;
      const next = !member.active;
      await staffService.updateStaff(id, { ...member, active: next } as any);
      setStaff(prev => prev.map(s => {
        if (s.id !== id) return s;
        toast(next ? `${s.name} activated` : `${s.name} deactivated`, {
          description: next ? 'Account is now active.' : 'Account has been deactivated.',
        });
        return { ...s, active: next };
      }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const filtered = filter === 'all' ? staff : staff.filter(s => s.access === filter);
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const declineRequest = (id: string) =>
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' } : r));

  const confirmApprove = () => {
    if (!approvingReq) return;
    setStaff(prev => [...prev, {
      id: `s${Date.now()}`,
      name: approvingReq.name,
      email: approvingReq.email,
      role: 'Member',
      access: 'custom' as AccessLevel,
      permissions: ['parking-slots'] as PermissionId[],
      active: true,
    }]);
    setRequests(prev => prev.map(r => r.id === approvingReq.id ? { ...r, status: 'approved' } : r));
    setApprovingReq(null);
  };

  function timeSince(d: Date) {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  }

  if (mode !== 'list' && editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={cancel} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Staff
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-foreground">{mode === 'create' ? 'New Staff Member' : editing.name}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{mode === 'create' ? 'Add Staff Member' : 'Edit Staff Member'}</h3>
          <p className="text-muted-foreground text-sm">{mode === 'create' ? 'Create a new staff account and set their access level.' : 'Update this staff member\'s details and permissions.'}</p>
        </div>
        <StaffForm initial={editing} onSave={save} onCancel={cancel} isNew={mode === 'create'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mode === 'access-settings' && (
        <div className="space-y-6">
          {loadingSettings ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : accessSettings ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Access Control Settings</h3>
                  <p className="text-muted-foreground text-sm">Configure default permissions and security policies.</p>
                </div>
                <button onClick={cancelSettings} className="px-4 py-2.5 bg-muted hover:bg-accent rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground">Back to Access Control</button>
              </div>
              <div className="bg-card rounded-2xl p-6 space-y-5 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Admin Default Permissions</label>
                    <input value={accessSettings.defaultAdminPermissions} onChange={e => setAccessSettings({...accessSettings, defaultAdminPermissions: e.target.value})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" placeholder="*" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Manager Default Permissions</label>
                    <input value={accessSettings.defaultManagerPermissions} onChange={e => setAccessSettings({...accessSettings, defaultManagerPermissions: e.target.value})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Operator Default Permissions</label>
                    <input value={accessSettings.defaultOperatorPermissions} onChange={e => setAccessSettings({...accessSettings, defaultOperatorPermissions: e.target.value})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Viewer Default Permissions</label>
                    <input value={accessSettings.defaultViewerPermissions} onChange={e => setAccessSettings({...accessSettings, defaultViewerPermissions: e.target.value})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Max Concurrent Sessions</label>
                    <input type="number" value={accessSettings.maxConcurrentSessions} onChange={e => setAccessSettings({...accessSettings, maxConcurrentSessions: parseInt(e.target.value) || 5})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="1" max="50" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Session Timeout (minutes)</label>
                    <input type="number" value={accessSettings.sessionTimeoutMinutes} onChange={e => setAccessSettings({...accessSettings, sessionTimeoutMinutes: parseInt(e.target.value) || 480})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="5" max="10080" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Max Failed Login Attempts</label>
                    <input type="number" value={accessSettings.maxFailedLoginAttempts} onChange={e => setAccessSettings({...accessSettings, maxFailedLoginAttempts: parseInt(e.target.value) || 5})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="1" max="20" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Lockout Duration (minutes)</label>
                    <input type="number" value={accessSettings.lockoutDurationMinutes} onChange={e => setAccessSettings({...accessSettings, lockoutDurationMinutes: parseInt(e.target.value) || 15})} className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors" min="1" max="1440" />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Require MFA for Admin</div>
                      <div className="text-xs text-muted-foreground">Enforce multi-factor authentication for admin accounts</div>
                    </div>
                    <input type="checkbox" checked={accessSettings.requireMfaForAdmin} onChange={e => setAccessSettings({...accessSettings, requireMfaForAdmin: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Require MFA for Manager</div>
                      <div className="text-xs text-muted-foreground">Enforce multi-factor authentication for manager accounts</div>
                    </div>
                    <input type="checkbox" checked={accessSettings.requireMfaForManager} onChange={e => setAccessSettings({...accessSettings, requireMfaForManager: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Allow Password Reset</div>
                      <div className="text-xs text-muted-foreground">Allow users to reset their passwords via email</div>
                    </div>
                    <input type="checkbox" checked={accessSettings.allowPasswordReset} onChange={e => setAccessSettings({...accessSettings, allowPasswordReset: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button onClick={cancelSettings} className="px-4 py-2.5 bg-muted hover:bg-accent rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={saveAccessSettings} disabled={savingSettings} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white disabled:opacity-50">
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">Failed to load access control settings</div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Access Control</h3>
          <p className="text-muted-foreground text-sm">Manage staff accounts and their system permissions.</p>
        </div>
        <button onClick={openAccessSettings} className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium text-white transition-colors">
          <Settings className="w-4 h-4" />
          Access Settings
        </button>
      </div>

      {/* ── Pending Access Requests ── */}
      {pendingRequests.length > 0 && (
        <div className="bg-card border border-amber-500/30 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-amber-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-400" />
            </span>
            <span className="text-sm font-semibold">Access Requests</span>
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">{pendingRequests.length} pending</span>
          </div>
          <div className="divide-y divide-border">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500 flex-shrink-0">
                  {req.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{req.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {req.email} · {req.phone} · <span className="font-mono">{req.plate}</span> ({req.vehicleType}) · {timeSince(req.requestedAt)}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => declineRequest(req.id)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => { setApprovingReq(req); setApproveAccess('operator'); }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve modal */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setApprovingReq(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="font-semibold">Approve Request</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground">{approvingReq.name}</span> will be granted access with the default permission set below.
              </p>
            </div>

            {/* Default permission display */}
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Default Access</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 font-medium">Custom</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Parking Slots — <span className="text-muted-foreground text-xs">Reserve and view parking slots only</span></span>
              </div>
              <p className="text-[11px] text-muted-foreground">All other sections are restricted. You can expand permissions later from the Staff page.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setApprovingReq(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors">Cancel</button>
              <button onClick={confirmApprove} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access level summary chips */}
      <div className="grid grid-cols-4 gap-3">
        {ACCESS_LEVELS.map(lvl => {
          const count = staff.filter(s => s.access === lvl.value).length;
          return (
            <button
              key={lvl.value}
              onClick={() => setFilter(f => f === lvl.value ? 'all' : lvl.value)}
              className={`p-3.5 rounded-xl border text-left transition-all ${filter === lvl.value ? `${lvl.bg} border-current` : 'bg-card border-border hover:bg-muted'}`}
            >
              <div className={`text-lg font-bold tabular-nums ${filter === lvl.value ? lvl.color : 'text-foreground'}`}>{count}</div>
              <div className={`text-xs font-medium mt-0.5 ${filter === lvl.value ? lvl.color : 'text-muted-foreground'}`}>{lvl.label}</div>
            </button>
          );
        })}
      </div>

      {/* Staff list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {filter === 'all' ? `${staff.length} staff members` : `${filtered.length} ${accessLevel(filter as AccessLevel).label}${filtered.length !== 1 ? 's' : ''}`}
          </span>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Clear filter</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">No staff members match this filter.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(member => {
              const lvl = accessLevel(member.access);
              const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group">
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${member.active ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{member.name}</span>
                      {!member.active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground font-medium flex-shrink-0">Inactive</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{member.role} · {member.email}</div>
                  </div>

                  {/* Access badge */}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${lvl.bg} ${lvl.color}`}>
                    {lvl.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => toggleActive(member.id)}
                      title={member.active ? 'Deactivate' : 'Activate'}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {member.active ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(member)}
                      title="Edit"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => remove(member.id)}
                      title="Remove"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Membership Plans ────────────────────────────────────────────────────────

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  color: string;
  features: string[];
  maxVehicles: number | 'unlimited';
  status: 'active' | 'inactive';
  popular: boolean;
}

const PLAN_COLORS = [
  { label: 'Blue',    value: 'blue',    bg: 'bg-blue-500',    text: 'text-blue-500',    soft: 'bg-blue-500/10 border-blue-500/30'    },
  { label: 'Indigo',  value: 'indigo',  bg: 'bg-indigo-500',  text: 'text-indigo-500',  soft: 'bg-indigo-500/10 border-indigo-500/30'  },
  { label: 'Violet',  value: 'violet',  bg: 'bg-violet-500',  text: 'text-violet-500',  soft: 'bg-violet-500/10 border-violet-500/30'  },
  { label: 'Emerald', value: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', soft: 'bg-emerald-500/10 border-emerald-500/30' },
  { label: 'Amber',   value: 'amber',   bg: 'bg-amber-500',   text: 'text-amber-500',   soft: 'bg-amber-500/10 border-amber-500/30'   },
  { label: 'Rose',    value: 'rose',    bg: 'bg-rose-500',    text: 'text-rose-500',    soft: 'bg-rose-500/10 border-rose-500/30'    },
];

const DEFAULT_PLANS: MembershipPlan[] = [];

function planColor(value: string) {
  return PLAN_COLORS.find(c => c.value === value) ?? PLAN_COLORS[0];
}

function blankPlan(): MembershipPlan {
  return { id: '', name: '', description: '', monthlyPrice: '9.99', annualPrice: '99.99', color: 'blue', features: [''], maxVehicles: 5, status: 'active', popular: false };
}

function PlanForm({ initial, onSave, onCancel, isNew, currencySymbol }: {
  initial: MembershipPlan;
  onSave: (p: MembershipPlan) => void;
  onCancel: () => void;
  isNew: boolean;
  currencySymbol: string;
}) {
  const [form, setForm] = useState<MembershipPlan>(initial);
  const set = (patch: Partial<MembershipPlan>) => setForm(prev => ({ ...prev, ...patch }));

  const addFeature = () => set({ features: [...form.features, ''] });
  const updateFeature = (i: number, val: string) => {
    const f = [...form.features]; f[i] = val; set({ features: f });
  };
  const removeFeature = (i: number) => set({ features: form.features.filter((_, j) => j !== i) });
  const col = planColor(form.color);

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Plan Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Plan Name</label>
            <input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. Professional" className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(['active', 'inactive'] as const).map(s => (
                <button key={s} type="button" onClick={() => set({ status: s })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${form.status === s ? (s === 'active' ? 'ring-2 ring-emerald-500/40 bg-emerald-500/10 border-transparent text-emerald-500' : 'ring-2 ring-gray-400/40 bg-gray-400/10 border-transparent text-gray-400') : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  <span className={`w-2 h-2 rounded-full ${s === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  {s === 'active' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Description</label>
          <input value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Short plan tagline" className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Plan Colour</label>
          <div className="flex gap-2">
            {PLAN_COLORS.map(c => (
              <button key={c.value} type="button" onClick={() => set({ color: c.value })}
                className={`w-8 h-8 rounded-full ${c.bg} transition-all ${form.color === c.value ? 'ring-2 ring-white/70 scale-110' : 'opacity-50 hover:opacity-80'}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Mark as Popular</div>
            <div className="text-xs text-muted-foreground">Highlights this plan with a "Most Popular" badge</div>
          </div>
          <Toggle on={form.popular} onToggle={() => set({ popular: !form.popular })} />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Pricing</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Monthly Price ({currencySymbol})</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
              <input type="number" min={0} step={0.01} value={form.monthlyPrice} onChange={e => set({ monthlyPrice: e.target.value })} className="w-full bg-background text-foreground rounded-lg pl-8 pr-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors tabular-nums" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Annual Price ({currencySymbol})</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
              <input type="number" min={0} step={0.01} value={form.annualPrice} onChange={e => set({ annualPrice: e.target.value })} className="w-full bg-background text-foreground rounded-lg pl-8 pr-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors tabular-nums" />
            </div>
          </div>
        </div>
        {parseFloat(form.monthlyPrice) > 0 && parseFloat(form.annualPrice) > 0 && (
          <p className="text-xs text-emerald-500">
            Annual saves {Math.round((1 - parseFloat(form.annualPrice) / (parseFloat(form.monthlyPrice) * 12)) * 100)}% vs monthly billing.
          </p>
        )}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Max Vehicles</label>
          <div className="flex gap-2">
            <input
              type="number" min={1}
              value={form.maxVehicles === 'unlimited' ? '' : form.maxVehicles}
              placeholder={form.maxVehicles === 'unlimited' ? 'Unlimited' : ''}
              onChange={e => set({ maxVehicles: e.target.value === '' ? 'unlimited' : Number(e.target.value) })}
              className="flex-1 bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors tabular-nums placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => set({ maxVehicles: form.maxVehicles === 'unlimited' ? 5 : 'unlimited' })}
              className={`px-4 py-3 rounded-lg text-sm border transition-all ${form.maxVehicles === 'unlimited' ? 'bg-blue-600 border-transparent text-white' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              Unlimited
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Features</div>
          <button type="button" onClick={addFeature} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors">
            <Plus className="w-3.5 h-3.5" />Add feature
          </button>
        </div>
        <div className="space-y-2">
          {form.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex-shrink-0 ${col.bg} flex items-center justify-center`}>
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </span>
              <input
                value={f}
                onChange={e => updateFeature(i, e.target.value)}
                placeholder="Feature description"
                className="flex-1 bg-background text-foreground rounded-lg px-3 py-2.5 outline-none border border-border focus:border-blue-600 transition-colors text-sm placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => removeFeature(i)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {form.features.length === 0 && <p className="text-xs text-muted-foreground">No features added yet.</p>}
        </div>
      </div>

      <div className="flex gap-3 pb-2">
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-white">
          {isNew ? 'Create Plan' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="px-6 py-3 bg-muted hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
}

function MembershipPlans({ currencySymbol, plans, setPlans }: { currencySymbol: string; plans: MembershipPlan[]; setPlans: React.Dispatch<React.SetStateAction<MembershipPlan[]>> }) {
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list');
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const openCreate = () => { setEditing(blankPlan()); setMode('create'); };
  const openEdit = (p: MembershipPlan) => { setEditing({ ...p }); setMode('edit'); };
  const cancel = () => { setMode('list'); setEditing(null); };

  const save = async (p: MembershipPlan) => {
    try {
      // Convert string prices to numbers for the backend
      const payload = {
        ...p,
        monthlyPrice: parseFloat(p.monthlyPrice as string) || 0,
        annualPrice: parseFloat(p.annualPrice as string) || 0,
      };
      if (mode === 'create') {
        const saved = await memberService.createPlan(payload as any);
        setPlans(prev => [...prev, saved]);
        toast.success('Plan created', { description: `${p.name} plan has been created.` });
      } else {
        const updated = await memberService.updatePlan(p.id, payload as any);
        setPlans(prev => prev.map(existing => existing.id === p.id ? updated : existing));
        toast.success('Plan updated', { description: `${p.name} plan has been updated.` });
      }
      setMode('list'); setEditing(null);
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to save plan.' });
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await memberService.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan deleted');
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to delete plan.' });
    }
  };
  const togglePopular = (id: string) => setPlans(prev => prev.map(p => p.id === id ? { ...p, popular: !p.popular } : p));

  if (mode !== 'list' && editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={cancel} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />Plans
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-foreground">{mode === 'create' ? 'New Plan' : editing.name}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{mode === 'create' ? 'Create Plan' : 'Edit Plan'}</h3>
          <p className="text-muted-foreground text-sm">{mode === 'create' ? 'Define a new membership tier and its pricing.' : "Update this plan's details and pricing."}</p>
        </div>
        <PlanForm initial={editing} onSave={save} onCancel={cancel} isNew={mode === 'create'} currencySymbol={currencySymbol} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Membership Plans</h3>
          <p className="text-muted-foreground text-sm">Manage tiers, features, and pricing for your members.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" />New Plan
        </button>
      </div>

      {/* Billing toggle */}
      <div className="inline-flex items-center bg-muted rounded-xl p-1 border border-border">
        {(['monthly', 'annual'] as const).map(cycle => (
          <button key={cycle} onClick={() => setBillingCycle(cycle)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${billingCycle === cycle ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
            {cycle}
            {cycle === 'annual' && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold">Save</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {plans.map(plan => {
          const col = planColor(plan.color);
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          const perLabel = billingCycle === 'monthly' ? '/mo' : '/yr';
          return (
            <div key={plan.id} className={`relative bg-card rounded-2xl border transition-all group ${plan.popular ? `border-2 ${col.soft.split(' ')[1]}` : 'border-border'}`}>
              {plan.popular && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${col.soft} ${col.text}`}>
                  <Crown className="w-3 h-3" />Most Popular
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0`}>
                      <CreditCard className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{plan.name}</div>
                      <div className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium inline-flex mt-0.5 ${plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-400/10 text-gray-400 border-gray-400/20'}`}>
                        {plan.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => togglePopular(plan.id)} title={plan.popular ? 'Remove popular' : 'Mark as popular'}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${plan.popular ? `${col.soft} ${col.text}` : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                      <Crown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(plan)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deletePlan(plan.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-3xl font-bold tabular-nums ${col.text}`}>{currencySymbol}{price}</span>
                  <span className="text-sm text-muted-foreground">{perLabel}</span>
                </div>

                <div className="space-y-1.5 mb-4">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${col.text}`} />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {plan.maxVehicles === 'unlimited' ? 'Unlimited vehicles' : `Up to ${plan.maxVehicles} vehicle${plan.maxVehicles !== 1 ? 's' : ''}`}
                  </span>
                  <button onClick={() => openEdit(plan)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${col.soft} ${col.text} border`}>
                    Edit Plan
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {plans.length === 0 && (
        <div className="bg-card rounded-2xl p-12 flex flex-col items-center text-center gap-3 border border-border">
          <CreditCard className="w-10 h-10 text-muted-foreground" />
          <div className="text-muted-foreground text-sm">No plans configured yet.<br />Create your first membership plan.</div>
          <button onClick={openCreate} className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors">Create Plan</button>
        </div>
      )}
    </div>
  );
}

// ─── Member Accounts ─────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  plan: string;
  vehicles: number;
  joined: string;
  status: 'active' | 'suspended' | 'pending';
  password?: string;
  vehicleType?: string;
}

const DEFAULT_MEMBERS: Member[] = [];

function MemberAccounts({ members, setMembers, plans }: { members: Member[]; setMembers: React.Dispatch<React.SetStateAction<Member[]>>; plans: MembershipPlan[] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Member['status'] | 'all'>('all');

  const toggleStatus = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    const next = member.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await memberService.updateMember(id, { ...member, status: next });
      setMembers(prev => prev.map(m => m.id === id ? updated : m));
      toast.success(next === 'active' ? 'Activated' : 'Suspended', { description: `${member.name} is now ${next}.` });
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to update status.' });
    }
  };
  const remove = async (id: string) => {
    const member = members.find(m => m.id === id);
    try {
      await memberService.deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      if (member) toast.error('Removed', { description: `${member.name} has been deleted.` });
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to delete member.' });
    }
  };

  const filtered = members.filter(m => {
    const matchSearch = (m.name ?? '').toLowerCase().includes(search.toLowerCase()) || (m.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusStyle = (s: Member['status']) => {
    if (s === 'active')    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'suspended') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  const planStyle = (plan: string) => {
    const map: Record<string, string> = {
      Free: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      Basic: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Professional: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
      Enterprise: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    return map[plan] ?? 'bg-muted text-muted-foreground border-border';
  };

  const counts = {
    active:    members.filter(m => m.status === 'active').length,
    suspended: members.filter(m => m.status === 'suspended').length,
    pending:   members.filter(m => m.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Member Accounts</h3>
        <p className="text-muted-foreground text-sm">View and manage all registered members and their plans.</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { label: 'Active',    value: 'active',    count: counts.active,    color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
          { label: 'Pending',   value: 'pending',   count: counts.pending,   color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30'   },
          { label: 'Suspended', value: 'suspended', count: counts.suspended, color: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/30'     },
        ] as const).map(s => (
          <button key={s.value} onClick={() => setFilterStatus(f => f === s.value ? 'all' : s.value)}
            className={`p-3.5 rounded-xl border text-left transition-all ${filterStatus === s.value ? `${s.bg} border-current` : 'bg-card border-border hover:bg-muted'}`}>
            <div className={`text-lg font-bold tabular-nums ${filterStatus === s.value ? s.color : 'text-foreground'}`}>{s.count}</div>
            <div className={`text-xs font-medium mt-0.5 ${filterStatus === s.value ? s.color : 'text-muted-foreground'}`}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-card text-foreground rounded-xl pl-11 pr-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {filtered.length} {filterStatus === 'all' ? 'members' : filterStatus}
          </span>
          {filterStatus !== 'all' && (
            <button onClick={() => setFilterStatus('all')} className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Clear filter</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">No members match your search.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(member => {
              const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${member.status === 'active' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{member.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{member.email} · {member.vehicles} vehicle{member.vehicles !== 1 ? 's' : ''} · Joined {member.joined}</div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${planStyle(member.plan)}`}>{member.plan}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 capitalize ${statusStyle(member.status)}`}>{member.status}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => toggleStatus(member.id)} title={member.status === 'active' ? 'Suspend' : 'Activate'}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      {member.status === 'active' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => remove(member.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Profile Settings ────────────────────────────────────────────────────────

function ProfileSettings({ profileName, profileAvatar, onSaveProfile }: {
  profileName: string;
  profileAvatar: string;
  onSaveProfile: (name: string, avatar: string) => void;
}) {
  const [username, setUsername] = useState(profileName);
  const [email, setEmail] = useState('admin@parkpulse.io');
  const [role] = useState('Facility Administrator');
  const [avatar, setAvatar] = useState(profileAvatar);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState('USER');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await profileService.fetchProfile();
        if (data) {
          setUsername(data.name || profileName);
          setEmail(data.email || '');
          if (data.avatar) setAvatar(data.avatar);
          setUserType(data.type || 'USER');
          if (data.role) {
            // Could update role display
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const initials = username.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profile = {
        name: username,
        email,
        avatar,
        phone: '',
        username: username,
        type: userType,
      } as any;
      await profileService.updateProfile(profile);
      onSaveProfile(username, avatar);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to save profile', { description: err.message || 'Please try again' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Profile</h3>
        <p className="text-muted-foreground text-sm">Update your display name, email, and profile photo.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
      {/* Avatar */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Profile Photo</div>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                {initials}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center border-2 border-card transition-colors cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <div>
            <label className="cursor-pointer px-4 py-2 bg-muted hover:bg-accent rounded-lg text-sm font-medium border border-border transition-colors inline-block">
              Upload Photo
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
            </label>
            {avatar && (
              <button onClick={() => setAvatar('')} className="ml-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg border border-border transition-colors">Remove</button>
            )}
            <p className="text-xs text-muted-foreground mt-1.5">JPG or PNG, max 2 MB</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card rounded-2xl p-6 space-y-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest">Account Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Display Name</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your name" className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Role</label>
            <input value={role} readOnly className="w-full bg-muted text-muted-foreground rounded-lg px-4 py-3 outline-none border border-border cursor-not-allowed" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full bg-background text-foreground rounded-lg px-4 py-3 outline-none border border-border focus:border-blue-600 transition-colors placeholder:text-muted-foreground" />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className={`px-6 py-3 rounded-lg transition-all font-medium text-white disabled:opacity-50 ${saved ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
        </>
      )}
    </div>
  );
}

// ─── Password & Security ─────────────────────────────────────────────────────

function PasswordSecurity() {
  const [step, setStep] = useState<'verify' | 'change'>('verify');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('admin');

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const profile = await profileService.fetchProfile();
        if (profile && profile.username) {
          setUsername(profile.username);
        }
      } catch (err) {
        console.warn('Failed to load profile username', err);
      }
    };
    loadUsername();
  }, []);

  const verify = async () => {
    if (!currentPw.trim()) { setError('Please enter your current password.'); return; }
    setError('');
    setLoading(true);
    try {
      try {
        await profileService.verifyPassword(username, currentPw);
        setStep('change');
      } catch (err: any) {
        setError('Incorrect current password.');
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (newPw.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await profileService.changePassword(currentPw, newPw);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false); setStep('verify');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const pwInput = (value: string, onChange: (v: string) => void, show: boolean, onToggle: () => void, placeholder: string) => (
    <div className="relative group">
      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-background text-foreground rounded-lg pl-11 pr-12 py-3 outline-none border border-border focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-muted-foreground" />
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Security</h3>
        <p className="text-muted-foreground text-sm">Change your account password.</p>
      </div>

      {step === 'verify' ? (
        <div className="bg-card rounded-2xl p-6 space-y-5 border border-border">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Verify Identity</div>
          <p className="text-sm text-muted-foreground">Enter your current password for <span className="font-medium text-foreground">{username}</span> to continue.</p>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Current Password</label>
            {pwInput(currentPw, setCurrentPw, showCurrent, () => setShowCurrent(v => !v), '••••••••')}
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <button onClick={verify} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-6 space-y-5 border border-border">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">New Password</div>
            <button onClick={() => { setStep('verify'); setError(''); }} className="text-xs text-blue-500 hover:text-blue-400 transition-colors">← Back</button>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">New Password</label>
            {pwInput(newPw, setNewPw, showNew, () => setShowNew(v => !v), 'Min. 8 characters')}
            {newPw.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[...Array(4)].map((_, i) => {
                  const strength = newPw.length >= 12 ? 4 : newPw.length >= 10 ? 3 : newPw.length >= 8 ? 2 : 1;
                  return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? (strength >= 4 ? 'bg-emerald-500' : strength === 3 ? 'bg-blue-500' : strength === 2 ? 'bg-amber-500' : 'bg-red-500') : 'bg-muted'}`} />;
                })}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Confirm New Password</label>
            {pwInput(confirmPw, setConfirmPw, showConfirm, () => setShowConfirm(v => !v), 'Repeat password')}
            {confirmPw.length > 0 && newPw !== confirmPw && (
              <p className="mt-1.5 text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <button onClick={save} disabled={success || loading}
            className={`w-full py-3 rounded-lg font-medium transition-all text-white disabled:opacity-50 ${success ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Updating...' : success ? '✓ Password Updated' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSettings, setActiveSettings] = useState('general');
  const [currency, setCurrency] = useState('lkr');
  const currencySymbol = CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol ?? 'රු';

  const [darkMode, setDarkMode] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [activeSlotsSubView, setActiveSlotsSubView] = useState<'map' | 'analytics' | 'vehicles'>('map');
  const [reportsOpen, setReportsOpen] = useState(false);
  const [activeReportsSubView, setActiveReportsSubView] = useState<'dashboard' | 'add' | 'view'>('dashboard');

  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
  const [plans, setPlans] = useState<MembershipPlan[]>(DEFAULT_PLANS);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_STAFF);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!sidebarExpanded) { setSettingsOpen(false); setSlotsOpen(false); setReportsOpen(false); }
  }, [sidebarExpanded]);

  // Load members, plans, zones, and staff from backend
  const loadData = async () => {
    try {
      const [fetchedMembers, fetchedPlans, fetchedZones, fetchedStaff] = await Promise.all([
        memberService.fetchMembers().catch(() => null),
        memberService.fetchPlans().catch(() => null),
        zoneService.fetchZones().catch(() => null),
        staffService.fetchStaff().catch(() => null),
      ]);
      if (fetchedMembers) {
        const mapped = fetchedMembers.map((m: any) => ({
          ...m,
          joined: m.joinedDate || m.joined || '',
        }));
        setMembers(mapped);
      }
      if (fetchedPlans) {
        const converted = fetchedPlans.map(p => ({
          ...p,
          monthlyPrice: String(p.monthlyPrice),
          annualPrice: String(p.annualPrice),
          maxVehicles: p.maxVehicles === 'unlimited' ? 'unlimited' as const : (Number(p.maxVehicles) || 5),
          status: p.status as 'active' | 'inactive',
        })) as MembershipPlan[];
        setPlans(converted);
      }
      if (fetchedZones) {
        const convertedZones = fetchedZones.map(z => ({
          ...z,
          ratePerHour: String(z.ratePerHour),
          status: z.status as 'active' | 'inactive' | 'maintenance',
        })) as Zone[];
        setZones(convertedZones);
      }
      if (fetchedStaff) {
        const convertedStaff = fetchedStaff.map(s => ({
          id: s.id,
          name: s.name,
          username: s.username,
          email: s.email,
          phone: s.phone || '',
          dob: s.joinDate || '',
          gender: '',
          role: s.role,
          access: s.access as AccessLevel,
          permissions: s.customPermissions || [],
          active: s.active,
          hasVehicle: !!s.vehicleNumber,
          vehiclePlate: s.vehicleNumber || '',
          vehicleType: s.vehicleType || '',
          vehicleMake: '',
          vehicleColor: '',
          password: '',
          avatar: s.avatar,
          shift: s.shift,
          status: s.status,
        })) as StaffMember[];
        setStaff(convertedStaff);
      }
    } catch (e) {
      console.warn('Failed to load data from backend, using defaults', e);
    }
  };

  // Auto-refresh interval: poll backend every 30s when autoRefresh is enabled
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    settingsService.fetchGeneral()
      .then(data => {
        if (data && typeof data.autoRefresh === 'boolean') {
          setAutoRefreshEnabled(data.autoRefresh);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      // Reload members, plans, zones, and staff to keep the dashboard fresh
      Promise.all([
        memberService.fetchMembers().catch(() => []),
        memberService.fetchPlans().catch(() => []),
        zoneService.fetchZones().catch(() => []),
        staffService.fetchStaff().catch(() => []),
      ]).then(([fetchedMembers, fetchedPlans, fetchedZones, fetchedStaff]) => {
        if (Array.isArray(fetchedMembers)) {
          const mapped = fetchedMembers.map((m: any) => ({
            ...m,
            joined: m.joinedDate || m.joined || '',
          }));
          setMembers(mapped);
        }
        if (Array.isArray(fetchedPlans)) {
          const converted = fetchedPlans.map(p => ({
            ...p,
            monthlyPrice: String(p.monthlyPrice),
            annualPrice: String(p.annualPrice),
            maxVehicles: p.maxVehicles === 'unlimited' ? 'unlimited' as const : (Number(p.maxVehicles) || 5),
            status: p.status as 'active' | 'inactive',
          })) as MembershipPlan[];
          setPlans(converted);
        }
        if (Array.isArray(fetchedZones)) {
          const convertedZones = fetchedZones.map(z => ({
            ...z,
            ratePerHour: String(z.ratePerHour),
            status: z.status as 'active' | 'inactive' | 'maintenance',
          })) as Zone[];
          setZones(prev => {
            const merged = [...prev];
            for (const z of convertedZones) {
              const idx = merged.findIndex(e => e.id === z.id);
              if (idx >= 0) merged[idx] = z; else merged.push(z);
            }
            return merged;
          });
        }
        if (Array.isArray(fetchedStaff)) {
          const convertedStaff = fetchedStaff.map(s => ({
            id: s.id,
            name: s.name,
            username: s.username,
            email: s.email,
            phone: s.phone || '',
            dob: s.joinDate || '',
            gender: '',
            role: s.role,
            access: s.access as AccessLevel,
            permissions: s.customPermissions || [],
            active: s.active,
            hasVehicle: !!s.vehicleNumber,
            vehiclePlate: s.vehicleNumber || '',
            vehicleType: s.vehicleType || '',
            vehicleMake: '',
            vehicleColor: '',
            password: '',
            avatar: s.avatar,
            shift: s.shift,
            status: s.status,
          })) as StaffMember[];
          setStaff(convertedStaff);
        }
      }).catch(() => {});
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);
  const [userRole, setUserRole] = useState<string>('');
  const [userAccess, setUserAccess] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [profileName, setProfileName] = useState('Admin User');
  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [memberPlan, setMemberPlan] = useState('');
  const [memberStatus, setMemberStatus] = useState('');
  const [memberJoinedDate, setMemberJoinedDate] = useState('');
  const [memberBillingCycle, setMemberBillingCycle] = useState('');
  const [memberNextRenewalDate, setMemberNextRenewalDate] = useState('');
  const [memberDaysRemaining, setMemberDaysRemaining] = useState(0);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberVehicles, setMemberVehicles] = useState(0);

  const [dashboardOccupied, setDashboardOccupied] = useState(0);
  const dashboardTotalSlots = zones.reduce((a: number, z: Zone) => a + z.totalSlots, 0);

  useEffect(() => {
    parkingService.fetchSlots()
      .then(slots => setDashboardOccupied(slots?.filter(s => s.occupied).length ?? 0))
      .catch(() => {});
  }, []);

  const handleSettingsNav = (section: string) => {
    setActiveView('settings');
    setActiveSettings(section);
  };

  const levelDefaults: Record<string, string[]> = {
    admin: ['*'],
    manager: ['dashboard', 'analytics', 'reports-admin', 'reports-staff', 'tickets', 'parking-slots',
              'staff-management', 'member-management',
              'settings-general', 'settings-security', 'settings-parking-slots', 'settings-access-control',
              'settings-profile', 'settings-password'],
    operator: ['dashboard', 'parking-slots', 'tickets'],
    viewer: ['dashboard'],
    member: ['parking-slots', 'settings-profile', 'settings-password'],
  };

  const effectivePermissions = (): string[] => {
    if (userAccess === 'admin') return ['*'];
    if (userPermissions.length > 0) return userPermissions;
    return levelDefaults[userAccess] || [];
  };

  const hasPermission = (required: string): boolean => {
    const perms = effectivePermissions();
    if (perms.includes('*')) return true;
    return perms.includes(required);
  };

  const settingsSubItems = [
    { id: 'general',             label: 'General Settings',  icon: Globe,        perm: 'settings-general' },
    { id: 'security',            label: 'Security Settings', icon: Shield,       perm: 'settings-security' },
    { id: 'parking-slots',       label: 'Slot Settings',     icon: ParkingSquare, perm: 'settings-parking-slots' },
    { id: 'access-control',      label: 'Access Control',    icon: KeyRound,     perm: 'settings-access-control' },
    { id: 'membership-plans',    label: 'Membership Plans',  icon: CreditCard,   perm: 'member-management' },
    { id: 'member-accounts',     label: 'Member Accounts',   icon: Users,        perm: 'member-management' },
    { id: 'reservation-history', label: 'Reservation History', icon: BookMarked, perm: 'tickets' },
    { id: 'profile',             label: 'Profile',             icon: User,       perm: 'settings-profile' },
    { id: 'password',            label: 'Security',            icon: Lock,       perm: 'settings-password' },
  ];

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={async (user, role, access, permissions) => {
          setLoggedIn(true);
          setUserRole(role);
          setUserAccess(access || '');
          setUserPermissions(permissions || []);
          if (role === 'MEMBER') {
            const memberName = localStorage.getItem('memberName') || user;
            setProfileName(memberName);
            setMemberPlan(localStorage.getItem('memberPlan') || '');
            setMemberStatus(localStorage.getItem('memberStatus') || '');
            setMemberJoinedDate(localStorage.getItem('memberJoinedDate') || '');
            setMemberBillingCycle(localStorage.getItem('memberBillingCycle') || '');
            setMemberNextRenewalDate(localStorage.getItem('memberNextRenewalDate') || '');
            setMemberDaysRemaining(Number(localStorage.getItem('memberDaysRemaining')) || 0);
            setMemberEmail(localStorage.getItem('memberEmail') || '');
            setMemberVehicles(Number(localStorage.getItem('memberVehicles')) || 0);
            setActiveView('subscription');
          } else {
            setProfileName(user === 'admin' ? 'System Administrator' : user);
          }
          await loadData();
        }}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(v => !v)}
        plans={plans}
      />
    );
  }

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarExpanded ? 'w-[220px]' : 'w-[60px]'} transition-all duration-200 ease-in-out bg-sidebar flex flex-col py-4 overflow-y-auto border-r border-sidebar-border flex-shrink-0`}>

        {/* Logo row */}
        <div className="px-3 mb-4">
          {sidebarExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-semibold tracking-tight whitespace-nowrap">ParkPulse</span>
              </div>
              <button
                onClick={() => setSidebarExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setSidebarExpanded(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-2">
          {/* Dashboard */}
          {hasPermission('dashboard') && (
          <button
            onClick={() => setActiveView('dashboard')}
            title={!sidebarExpanded ? 'Dashboard' : undefined}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
              activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>Dashboard</span>}
          </button>
          )}

          {/* My Subscription (member only) */}
          {userRole === 'MEMBER' && (
          <button
            onClick={() => setActiveView('subscription')}
            title={!sidebarExpanded ? 'My Subscription' : undefined}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
              activeView === 'subscription' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
            }`}
          >
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>My Subscription</span>}
          </button>
          )}

          {/* Parking Slots with dropdown */}
          {hasPermission('parking-slots') && (
          <div>
            <button
              onClick={() => {
                if (!sidebarExpanded) {
                  setSidebarExpanded(true);
                  setSlotsOpen(true);
                  setActiveView('slots');
                  setActiveSlotsSubView('map');
                } else {
                  setSlotsOpen(prev => !prev);
                  setActiveView('slots');
                  setActiveSlotsSubView('map');
                }
              }}
              title={!sidebarExpanded ? 'Parking Slots' : undefined}
              className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
                activeView === 'slots' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Circle className="w-4 h-4 flex-shrink-0" />
              {sidebarExpanded && (
                <>
                  <span className="flex-1 text-left">Parking Slots</span>
                  {slotsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
            {sidebarExpanded && slotsOpen && (
              <div className="mt-0.5 ml-3 space-y-0.5 border-l border-sidebar-border pl-2.5">
                {([
                  { id: 'analytics' as 'analytics' | 'vehicles', label: 'Analytics',  Icon: BarChart3 as typeof BarChart3 },
                  { id: 'vehicles'  as 'analytics' | 'vehicles', label: 'Vehicles',   Icon: Users     as typeof Users     },
                ]).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveView('slots'); setActiveSlotsSubView(id); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      activeView === 'slots' && activeSlotsSubView === id
                        ? 'bg-blue-600/20 text-blue-500'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Members */}
          {hasPermission('member-management') && (
          <button
            onClick={() => setActiveView('members')}
            title={!sidebarExpanded ? 'Members' : undefined}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
              activeView === 'members' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>Members</span>}
          </button>
          )}

          {/* Staff */}
          {hasPermission('staff-management') && (
          <button
            onClick={() => setActiveView('staff')}
            title={!sidebarExpanded ? 'Staff' : undefined}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
              activeView === 'staff' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
            }`}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>Staff</span>}
          </button>
          )}

          {/* Tickets */}
          {hasPermission('tickets') && (
          <button
            onClick={() => setActiveView('tickets')}
            title={!sidebarExpanded ? 'Tickets' : undefined}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
              activeView === 'tickets' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
            }`}
          >
            <Ticket className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>Tickets</span>}
          </button>
          )}

          {/* Reports with dropdown */}
          {(hasPermission('reports-admin') || hasPermission('reports-staff')) && (
          <div>
            <button
              onClick={() => {
                if (!sidebarExpanded) {
                  setSidebarExpanded(true);
                  setReportsOpen(true);
                  setActiveView('reports');
                  setActiveReportsSubView('dashboard');
                } else {
                  setReportsOpen(prev => !prev);
                  setActiveView('reports');
                  setActiveReportsSubView('dashboard');
                }
              }}
              title={!sidebarExpanded ? 'Reports' : undefined}
              className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
                activeView === 'reports' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {sidebarExpanded && (
                <>
                  <span className="flex-1 text-left">Reports</span>
                  {reportsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
            {sidebarExpanded && reportsOpen && (
              <div className="mt-0.5 ml-3 space-y-0.5 border-l border-sidebar-border pl-2.5">
                {([
                  { id: 'add'  as const, label: 'Add Report',   Icon: Plus     },
                  { id: 'view' as const, label: 'View Reports',  Icon: FileText },
                ]).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveView('reports'); setActiveReportsSubView(id); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      activeView === 'reports' && activeReportsSubView === id
                        ? 'bg-blue-600/20 text-blue-500'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Settings with dropdown */}
          {settingsSubItems.some(i => hasPermission(i.perm)) && (
          <div>
            <button
              onClick={() => {
                const firstVisible = settingsSubItems.find(i => hasPermission(i.perm));
                if (!sidebarExpanded) {
                  setSidebarExpanded(true);
                  setSettingsOpen(true);
                  setActiveView('settings');
                  setActiveSettings(firstVisible?.id || 'profile');
                } else {
                  setSettingsOpen(prev => !prev);
                  setActiveView('settings');
                  if (!hasPermission(activeSettings)) setActiveSettings(firstVisible?.id || 'profile');
                }
              }}
              title={!sidebarExpanded ? 'Settings' : undefined}
              className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg nav-item ${
                activeView === 'settings' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 nav-active' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {sidebarExpanded && (
                <>
                  <span className="flex-1 text-left">Settings</span>
                  {settingsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </button>
            {sidebarExpanded && settingsOpen && (
              <div className="mt-0.5 ml-3 space-y-0.5 border-l border-sidebar-border pl-2.5">
                {settingsSubItems
                  .filter(item => hasPermission(item.perm))
                  .map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleSettingsNav(id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      activeView === 'settings' && activeSettings === id
                        ? 'bg-blue-600/20 text-blue-500'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          )}

        </nav>

        {/* Bottom actions */}
        <div className="mt-auto pt-3 border-t border-sidebar-border px-2 space-y-0.5">
          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode(v => !v)}
            title={!sidebarExpanded ? (darkMode ? 'Light Mode' : 'Dark Mode') : undefined}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors`}
          >
            {darkMode ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
            {sidebarExpanded && <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          {/* Sign Out */}
          <button
            onClick={() => { authLogout(); }}
            title={!sidebarExpanded ? 'Sign Out' : undefined}
            className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-3' : 'justify-center px-2'} py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-background flex flex-col">

        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold leading-tight">
              {activeView === 'settings'
                ? settingsSubItems.find(s => s.id === activeSettings)?.label ?? 'Settings'
                : activeView === 'slots'
                ? activeSlotsSubView === 'analytics' ? 'Slot Analytics' : activeSlotsSubView === 'vehicles' ? 'Vehicles' : 'Parking Slots'
                : activeView === 'tickets' ? 'Tickets'
                : activeView === 'members' ? 'Members'
                : activeView === 'staff'   ? 'Staff'
                : activeView === 'reports'
                ? (activeReportsSubView === 'add' ? 'Add Report' : activeReportsSubView === 'view' ? 'View Reports' : 'Reports')
                : activeView === 'subscription' ? 'My Subscription'
                : 'Overview Dashboard'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeView === 'settings'
                ? 'Configure your ParkPulse preferences.'
                : activeView === 'slots'
                ? activeSlotsSubView === 'analytics' ? 'Occupancy trends and zone performance.' : activeSlotsSubView === 'vehicles' ? 'Currently parked vehicles across all zones.' : 'Overview of slots and zones across your facility.'
                : activeView === 'tickets' ? 'Parking tickets for all active and past vehicle sessions.'
                : activeView === 'members' ? 'Manage registered members and their membership plans.'
                : activeView === 'staff'   ? 'Manage staff accounts and their access levels.'
                : activeView === 'reports'
                ? (activeReportsSubView === 'add' ? 'Generate a new report for any time range and data type.' : activeReportsSubView === 'view' ? 'Browse, download, and manage generated reports.' : 'Overview of report activity and recent system actions.')
                : activeView === 'subscription' ? 'Your membership plan, billing cycle, and renewal details.'
                : 'Manage your parking facility with ease.'}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border">
            {profileAvatar ? (
              <img src={profileAvatar} alt="Profile" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {profileName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium">{profileName.split(' ')[0]}</span>
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 p-6 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
        <motion.div
          key={activeView === 'settings' ? `settings-${activeSettings}` : activeView === 'slots' ? `slots-${activeSlotsSubView}` : activeView === 'reports' ? `reports-${activeReportsSubView}` : activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="h-full"
        >

          {/* Settings View */}
          {activeView === 'settings' && (
            <div className="max-w-3xl mx-auto w-full pb-4">
              {activeSettings === 'general'           && hasPermission('settings-general') && <GeneralSettings darkMode={darkMode} onToggleDarkMode={() => setDarkMode(v => !v)} currency={currency} onCurrencyChange={setCurrency} autoRefresh={autoRefreshEnabled} onToggleAutoRefresh={() => setAutoRefreshEnabled(v => !v)} />}
              {activeSettings === 'security'          && hasPermission('settings-security') && <SecuritySettings />}
              {activeSettings === 'parking-slots'     && hasPermission('settings-parking-slots') && <ParkingSlotSettings currencySymbol={currencySymbol} zones={zones} setZones={setZones} />}
              {activeSettings === 'access-control'    && hasPermission('settings-access-control') && <AccessControl staff={staff} setStaff={setStaff} />}
              {activeSettings === 'membership-plans'  && hasPermission('member-management') && <MembershipPlans currencySymbol={currencySymbol} plans={plans} setPlans={setPlans} />}
              {activeSettings === 'member-accounts'   && hasPermission('member-management') && <MemberAccounts members={members} setMembers={setMembers} plans={plans} />}
              {activeSettings === 'reservation-history' && hasPermission('tickets') && <ReservationHistory />}
              {activeSettings === 'profile'           && <ProfileSettings profileName={profileName} profileAvatar={profileAvatar} onSaveProfile={(name, avatar) => { setProfileName(name); setProfileAvatar(avatar); }} />}
              {activeSettings === 'password'          && hasPermission('settings-password') && <PasswordSecurity />}
            </div>
          )}

          {/* Reports View */}
          {(activeView === 'reports') && (hasPermission('reports-admin') || hasPermission('reports-staff')) && (
            <div className="max-w-[1400px] mx-auto w-full">
              <ReportsView subView={activeReportsSubView} hasAdminReports={hasPermission('reports-admin')} />
            </div>
          )}

          {/* Staff View */}
          {activeView === 'staff' && hasPermission('staff-management') && (
            <div className="max-w-[1400px] mx-auto w-full">
              <StaffView staff={staff} setStaff={setStaff} />
            </div>
          )}

          {/* Members View */}
          {activeView === 'members' && hasPermission('member-management') && (
            <div className="max-w-[1400px] mx-auto w-full">
              <MembersView
                members={members}
                setMembers={setMembers}
                plans={plans}
              />
            </div>
          )}

          {/* Tickets View */}
          {activeView === 'tickets' && hasPermission('tickets') && (
            <div className="max-w-[1400px] mx-auto w-full">
              <TicketsView currencySymbol={currencySymbol} />
            </div>
          )}

          {/* Parking Slots View */}
          {activeView === 'slots' && (
            <div className="max-w-[1400px] mx-auto w-full">
              <ParkingSlotsView
                zones={zones}
                currencySymbol={currencySymbol}
                subView={activeSlotsSubView}
                members={members.map(m => ({ id: m.id, name: m.name, email: m.email, plan: m.plan, vehicleType: m.vehicleType }))}
                staff={staff.map(s => ({ id: s.id, name: s.name, email: s.email, role: s.role, vehicleType: s.vehicleType }))}
                userAccess={userAccess}
                profileName={profileName}
                memberEmail={memberEmail}
              />
            </div>
          )}

          {/* My Subscription View */}
          {activeView === 'subscription' && userRole === 'MEMBER' && (
            <div className="max-w-2xl mx-auto w-full">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profileName}</h2>
                    <p className="text-sm text-muted-foreground">{memberEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Plan</p>
                    <p className="text-lg font-semibold">{memberPlan || 'Free'}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      memberStatus === 'active' ? 'bg-emerald-500/20 text-emerald-500' :
                      memberStatus === 'suspended' ? 'bg-red-500/20 text-red-500' :
                      'bg-amber-500/20 text-amber-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        memberStatus === 'active' ? 'bg-emerald-500' :
                        memberStatus === 'suspended' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      {memberStatus ? memberStatus.charAt(0).toUpperCase() + memberStatus.slice(1) : 'Active'}
                    </span>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Billing Cycle</p>
                    <p className="text-lg font-semibold">{memberBillingCycle === 'ANNUAL' ? 'Annual' : 'Monthly'}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Joined</p>
                    <p className="text-lg font-semibold">{memberJoinedDate}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Next Renewal</p>
                    <p className="text-sm font-medium">{memberNextRenewalDate || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className={`text-2xl font-bold tabular-nums ${
                      memberDaysRemaining > 30 ? 'text-emerald-500' :
                      memberDaysRemaining > 7 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {memberDaysRemaining}
                    </p>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        memberDaysRemaining > 30 ? 'bg-emerald-500' :
                        memberDaysRemaining > 7 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, (memberDaysRemaining / 365) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Vehicles Registered</p>
                    <p className="text-lg font-semibold">{memberVehicles}</p>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      onClick={() => setActiveView('slots')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Parking Slots
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {activeView === 'dashboard' && hasPermission('dashboard') && (
            <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-4 h-full">
              <AnalyticsSection
                occupiedSlots={dashboardOccupied}
                totalSlots={dashboardTotalSlots}
                currencySymbol={currencySymbol}
              />
            </div>
          )}

        </motion.div>
        </AnimatePresence>
        </div>
      </div>

      <AIChatWidget />
      <Toaster position="bottom-right" offset={72} richColors closeButton />
    </div>
  );
}

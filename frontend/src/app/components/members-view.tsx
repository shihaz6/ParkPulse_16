import { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Users, UserCheck,
  ShieldOff, ShieldCheck, Car, Calendar, Crown,
  CheckCircle2, Clock, AlertTriangle, CreditCard, Lock, AtSign, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { memberService } from '../memberService';

// ─── Types (must stay in sync with App.tsx) ────────────────────────────────

interface MembershipPlan {
  id: string;
  name: string;
  color: string;
  monthlyPrice: string;
  annualPrice: string;
  status: 'active' | 'inactive';
  maxVehicles: number | 'unlimited';
}

interface Member {
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

// ─── Helpers ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600',
];

function avatarColor(name: string | null | undefined) {
  const idx = (name?.charCodeAt(0) ?? 65) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function initials(name: string | null | undefined) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const PLAN_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  blue:    { text: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
  indigo:  { text: 'text-indigo-500',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20'  },
  violet:  { text: 'text-violet-500',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20'  },
  emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  amber:   { text: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
  rose:    { text: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'    },
};

function planBadgeStyle(color: string) {
  return PLAN_COLORS[color] ?? { text: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  active:    { label: 'Active',    color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: CheckCircle2   },
  pending:   { label: 'Pending',   color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   Icon: Clock          },
  suspended: { label: 'Suspended', color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: AlertTriangle  },
  inactive:  { label: 'Inactive',  color: 'text-gray-500',    bg: 'bg-gray-500/10',    border: 'border-gray-500/20',    Icon: ShieldOff      },
};

// ─── Card type detection ───────────────────────────────────────────────────

function detectCardType(num: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
}

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// ─── Add / Edit Modal ──────────────────────────────────────────────────────

function MemberModal({
  initial,
  plans,
  onSave,
  onClose,
  isNew,
}: {
  initial: Member;
  plans: MembershipPlan[];
  onSave: (m: Member) => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<Member>(initial);
  const set = (patch: Partial<Member>) => setForm(prev => ({ ...prev, ...patch }));

  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' });
  const setCard_ = (p: Partial<typeof card>) => setCard(prev => ({ ...prev, ...p }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [phoneLocal, setPhoneLocal] = useState(
    form.phone?.startsWith('+94') ? form.phone.slice(3).trim() : (form.phone ?? '')
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name     = 'Name is required.';
    if (!form.username?.trim()) e.username = 'Username is required.';
    else if (/\s/.test(form.username ?? '')) e.username = 'Username cannot contain spaces.';
    if (!form.email.trim())    e.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format.';
    if (isNew && !form.password?.trim()) e.password = 'Password is required.';
    else if (isNew && (form.password?.length ?? 0) < 6) e.password = 'Password must be at least 6 characters.';
    if (!form.plan) e.plan = 'Please select a plan.';
    // Validate card only if any card field is filled (on edit, card is optional)
    const cardTouched = card.holder || card.number || card.expiry || card.cvv;
    if (isNew || cardTouched) {
      if (!card.holder.trim())                         e.holder = 'Cardholder name is required.';
      if (card.number.replace(/\s/g, '').length < 13) e.number = 'Enter a valid card number.';
      if (!/^\d{2}\/\d{2}$/.test(card.expiry))        e.expiry = 'Use MM/YY format.';
      if (card.cvv.length < 3)                         e.cvv    = 'Enter a valid CVV.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    const withPhone = { ...form, phone: phoneLocal.trim() ? `+94 ${phoneLocal.trim()}` : '' };
    if (!validate()) return;
    onSave(withPhone);
  };

  const inp = (label: string, key: keyof Member, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={String(form[key] ?? '')}
        onChange={e => set({ [key]: type === 'number' ? Number(e.target.value) : e.target.value } as Partial<Member>)}
        placeholder={placeholder}
        className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border transition-colors placeholder:text-muted-foreground text-sm ${
          errors[key] ? 'border-red-500' : 'border-border focus:border-blue-500'
        }`}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  const cardType = detectCardType(card.number);
  const selectedPlan = plans.find(p => p.name === form.plan);
  const selectedPrice = selectedPlan
    ? billing === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold">{isNew ? 'Add Member' : 'Edit Member'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNew ? 'Register a new member and assign a plan.' : 'Update member details and plan.'}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* Personal details */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Personal Details</p>

            <div className="grid grid-cols-2 gap-3">
              {inp('Full Name', 'name', 'text', 'e.g. Sarah Chen')}
              {inp('Email Address', 'email', 'email', 'e.g. sarah@email.com')}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Username <span className="text-red-500">*</span></label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={form.username ?? ''}
                  onChange={e => set({ username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  placeholder="e.g. sarah.chen"
                  className={`w-full bg-background text-foreground rounded-xl pl-9 pr-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.username ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
                />
              </div>
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            {/* Phone — Sri Lankan */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Phone <span className="text-muted-foreground/50">(optional)</span></label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground flex-shrink-0 select-none">
                  <span className="text-base leading-none">🇱🇰</span>
                  <span className="text-muted-foreground">+94</span>
                </div>
                <input
                  value={phoneLocal}
                  onChange={e => setPhoneLocal(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="77 000 0000"
                  className="flex-1 bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm placeholder:text-muted-foreground"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Enter the 9-digit number after +94 (e.g. 771234567)</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                {isNew ? <>Password <span className="text-red-500">*</span></> : 'New Password'}
                {!isNew && <span className="ml-1 text-muted-foreground/50">(leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password ?? ''}
                  onChange={e => set({ password: e.target.value })}
                  placeholder={isNew ? 'Min. 6 characters' : '••••••••'}
                  className={`w-full bg-background text-foreground rounded-xl pl-9 pr-10 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.password ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              {/* Strength indicator */}
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => {
                    const len = form.password?.length ?? 0;
                    const strength = len >= 12 ? 4 : len >= 9 ? 3 : len >= 6 ? 2 : 1;
                    return (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        i < strength
                          ? strength === 4 ? 'bg-emerald-500' : strength === 3 ? 'bg-blue-500' : strength === 2 ? 'bg-amber-500' : 'bg-red-500'
                          : 'bg-muted'
                      }`} />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Plan selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-muted-foreground">Membership Plan</label>
              {/* Billing toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 border border-border">
                {(['monthly', 'annual'] as const).map(cycle => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBilling(cycle)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                      billing === cycle ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cycle}
                    {cycle === 'annual' && <span className="ml-1 text-emerald-500">−20%</span>}
                  </button>
                ))}
              </div>
            </div>

            {plans.length === 0 ? (
              <p className="text-xs text-amber-500 px-4 py-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                No plans found. Create a plan in Settings → Membership Plans first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {plans.map(plan => {
                  const col = planBadgeStyle(plan.color);
                  const selected = form.plan === plan.name;
                  const inactive = plan.status === 'inactive';
                  const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      disabled={inactive}
                      onClick={() => !inactive && set({ plan: plan.name })}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all text-sm ${
                        inactive
                          ? 'border-border bg-background opacity-40 cursor-not-allowed'
                          : selected
                          ? `${col.bg} ${col.border} ${col.text} ring-1 ring-current`
                          : 'border-border hover:border-blue-500/40 bg-background'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${col.bg}`}>
                        <Crown className={`w-3.5 h-3.5 ${col.text}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="font-medium truncate">{plan.name}</p>
                          {inactive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border flex-shrink-0">Inactive</span>}
                        </div>
                        <p className={`text-sm font-bold ${selected ? col.text : 'text-foreground'}`}>
                          රු{parseFloat(price || '0').toFixed(2)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            /{billing === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {plan.maxVehicles === 'unlimited' ? 'Unlimited' : plan.maxVehicles} vehicle{plan.maxVehicles !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.plan && <p className="mt-1 text-xs text-red-500">{errors.plan}</p>}

            {/* Selected plan summary */}
            {selectedPlan && selectedPrice && (
              <div className="mt-2 px-4 py-2.5 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{selectedPlan.name}</span> · {billing === 'monthly' ? 'Monthly' : 'Annual'} billing
                </span>
                <span className="text-sm font-bold text-blue-500">
                  රු{parseFloat(selectedPrice).toFixed(2)}/{billing === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Number of Vehicles</label>
              <input
                type="number" min={1} max={20} value={form.vehicles}
                onChange={e => set({ vehicles: Math.max(1, Number(e.target.value)) })}
                className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set({ status: e.target.value as Member['status'] })}
                className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Bank card details */}
          {(
            <div className="bg-background border border-border rounded-2xl overflow-hidden">
              {/* Card preview strip */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">Payment Details</span>
                </div>
                <div className="flex items-center gap-2">
                  {cardType === 'visa'       && <span className="text-white font-bold text-sm tracking-widest">VISA</span>}
                  {cardType === 'mastercard' && (
                    <span className="flex">
                      <span className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
                      <span className="w-5 h-5 rounded-full bg-amber-400 opacity-90 -ml-2" />
                    </span>
                  )}
                  {cardType === 'amex'       && <span className="text-white font-bold text-sm">AMEX</span>}
                  {cardType === 'unknown'    && <span className="text-white/40 text-xs">Card type</span>}
                  <Lock className="w-4 h-4 text-white/60" />
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Card number */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Card Number</label>
                  <input
                    value={card.number}
                    onChange={e => setCard_({ number: formatCardNumber(e.target.value) })}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${
                      errors.number ? 'border-red-500' : 'border-border focus:border-blue-500'
                    }`}
                  />
                  {errors.number && <p className="mt-1 text-xs text-red-500">{errors.number}</p>}
                </div>

                {/* Holder */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Cardholder Name</label>
                  <input
                    value={card.holder}
                    onChange={e => setCard_({ holder: e.target.value.toUpperCase() })}
                    placeholder="NAME ON CARD"
                    className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm uppercase placeholder:normal-case placeholder:text-muted-foreground tracking-wide transition-colors ${
                      errors.holder ? 'border-red-500' : 'border-border focus:border-blue-500'
                    }`}
                  />
                  {errors.holder && <p className="mt-1 text-xs text-red-500">{errors.holder}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Expiry */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Expiry Date</label>
                    <input
                      value={card.expiry}
                      onChange={e => setCard_({ expiry: formatExpiry(e.target.value) })}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${
                        errors.expiry ? 'border-red-500' : 'border-border focus:border-blue-500'
                      }`}
                    />
                    {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
                  </div>
                  {/* CVV */}
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">CVV</label>
                    <input
                      value={card.cvv}
                      onChange={e => setCard_({ cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${
                        errors.cvv ? 'border-red-500' : 'border-border focus:border-blue-500'
                      }`}
                    />
                    {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
                  </div>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <Lock className="w-3 h-3" />
                  {isNew ? 'Your card details are encrypted and stored securely.' : 'Leave blank to keep the existing card on file.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isNew ? <><Plus className="w-4 h-4" />Add Member</> : <><CheckCircle2 className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────

function DeleteConfirm({ member, onConfirm, onClose }: {
  member: Member;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="font-semibold mb-1">Remove Member</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to remove <span className="font-medium text-foreground">{member.name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Remove</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

function blankMember(): Member {
  return { 
    id: crypto.randomUUID(), 
    name: '', 
    email: '', 
    phone: '', 
    plan: '', 
    vehicles: 1, 
    joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
    status: 'active' 
  };
}

export function MembersView({
  members,
  setMembers,
  plans,
}: {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  plans: MembershipPlan[];
}) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Member['status'] | 'all'>('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; member: Member } | null>(null);
  const [toDelete, setToDelete] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);

  const counts = {
    all:       members.length,
    active:    members.filter(m => m.status === 'active').length,
    pending:   members.filter(m => m.status === 'pending').length,
    suspended: members.filter(m => m.status === 'suspended').length,
  };

  const filtered = useMemo(() => {
    return members.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !search || (m.name ?? '').toLowerCase().includes(q) || (m.email ?? '').toLowerCase().includes(q) || (m.plan ?? '').toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchPlan   = filterPlan   === 'all' || m.plan === filterPlan;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [members, search, filterStatus, filterPlan]);

  const save = async (m: Member) => {
    setLoading(true);
    try {
      if (modal?.mode === 'add') {
        const saved = await memberService.createMember(m);
        setMembers(prev => [...prev, saved]);
        toast.success('Member added', { description: `${m.name} has been registered on the ${m.plan} plan.` });
      } else {
        const updated = await memberService.updateMember(m.id, m);
        setMembers(prev => prev.map(x => x.id === m.id ? updated : x));
        toast.success('Member updated', { description: `${m.name}'s details have been saved.` });
      }
      setModal(null);
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    const member = members.find(m => m.id === id);
    setLoading(true);
    try {
      await memberService.deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      if (member) toast.error('Member removed', { description: `${member.name} has been deleted.` });
      setToDelete(null);
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to delete member.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    // Status transition: active -> suspended -> inactive -> active
    let next: 'active' | 'suspended' | 'inactive' | 'pending';
    let action: 'suspend' | 'activate' | 'deactivate';
    
    switch (member.status) {
      case 'active':
        next = 'suspended';
        action = 'suspend';
        break;
      case 'suspended':
        next = 'inactive';
        action = 'deactivate';
        break;
      case 'inactive':
        next = 'active';
        action = 'activate';
        break;
      case 'pending':
        next = 'active';
        action = 'activate';
        break;
      default:
        next = 'active';
        action = 'activate';
    }

    setLoading(true);
    try {
      let updated;
      if (action === 'suspend') {
        updated = await memberService.suspendMember(id);
      } else if (action === 'activate') {
        updated = await memberService.activateMember(id);
      } else {
        updated = await memberService.deactivateMember(id);
      }
      setMembers(prev => prev.map(m => m.id === id ? updated : m));
      
      const messages: Record<string, { title: string; desc: string }> = {
        suspend: { title: `${member.name} suspended`, desc: 'Account has been suspended.' },
        activate: { title: `${member.name} activated`, desc: 'Account is now active.' },
        deactivate: { title: `${member.name} deactivated`, desc: 'Account has been deactivated.' },
      };
      toast(messages[action].title, { description: messages[action].desc });
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Failed to update status.' });
    } finally {
      setLoading(false);
    }
  };

  const uniquePlans = Array.from(new Set(plans.map(p => p.name))).filter(Boolean);

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setModal({ mode: 'add', member: blankMember() })}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium btn-glow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {([
          { key: 'all',       label: 'Total Members', Icon: Users,      color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
          { key: 'active',    label: 'Active',        Icon: UserCheck,  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { key: 'pending',   label: 'Pending',       Icon: Clock,      color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
          { key: 'suspended', label: 'Suspended',     Icon: ShieldOff,  color: 'text-red-500',     bg: 'bg-red-500/10'     },
        ] as const).map(({ key, label, Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key === 'all' ? 'all' : key as Member['status'])}
            className={`bg-card border rounded-2xl p-5 flex items-center gap-4 text-left hover-lift hover:border-blue-500/40 ${
              filterStatus === key ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-border'
            }`}
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-2xl font-bold">{counts[key]}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Search + filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, plan…"
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: 'all',       label: 'All'       },
            { key: 'active',    label: 'Active'    },
            { key: 'pending',   label: 'Pending'   },
            { key: 'suspended', label: 'Suspended' },
          ] as { key: 'all' | Member['status']; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === key ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Plan filter */}
        {uniquePlans.length > 0 && (
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            className="bg-card text-sm text-foreground rounded-xl px-3 py-2 border border-border outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">All Plans</option>
            {uniquePlans.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[2.5fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Member</span>
          <span>Email</span>
          <span>Plan</span>
          <span>Vehicles</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                {search || filterStatus !== 'all' || filterPlan !== 'all'
                  ? 'No members match your filters.'
                  : 'No members yet. Add your first member to get started.'}
              </p>
              {!search && filterStatus === 'all' && filterPlan === 'all' && (
                <button
                  onClick={() => setModal({ mode: 'add', member: blankMember() })}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              )}
            </div>
          ) : (
            filtered.map(member => {
              const plan = plans.find(p => p.name === member.plan);
              const col = plan ? planBadgeStyle(plan.color) : { text: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
              const statusCfg = STATUS_CFG[member.status] ?? STATUS_CFG.inactive;
              const StatusIcon = statusCfg.Icon;

              return (
                <div
                  key={member.id}
                  className="grid grid-cols-[2.5fr_2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/20 hover-row group"
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarColor(member.name)}`}>
                      {initials(member.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {member.username && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground font-mono">
                            <AtSign className="w-3 h-3" />{member.username}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground/50">·</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {member.joined}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email + phone */}
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    {member.phone && <p className="text-xs text-muted-foreground/60 truncate">{member.phone}</p>}
                  </div>

                  {/* Plan badge */}
                  <div>
                    {member.plan ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${col.bg} ${col.text} ${col.border}`}>
                        <Crown className="w-3 h-3" />
                        {member.plan}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Vehicles */}
                  <div className="flex items-center gap-1.5 text-sm">
                    <Car className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{member.vehicles}</span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ mode: 'edit', member: { ...member } })}
                      title="Edit"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleStatus(member.id)}
                      title={
                        member.status === 'active' ? 'Suspend' :
                        member.status === 'suspended' ? 'Deactivate' : 'Activate'
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {member.status === 'active' ? (
                        <ShieldOff className="w-3.5 h-3.5" />
                      ) : member.status === 'suspended' ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setToDelete(member)}
                      title="Remove"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground bg-muted/10">
            Showing {filtered.length} of {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <MemberModal
          initial={modal.member}
          plans={plans}
          onSave={save}
          onClose={() => setModal(null)}
          isNew={modal.mode === 'add'}
        />
      )}

      {/* Delete confirm */}
      {toDelete && (
        <DeleteConfirm
          member={toDelete}
          onConfirm={() => remove(toDelete.id)}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

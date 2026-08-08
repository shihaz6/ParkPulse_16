import { useState, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, X, Search, Shield,
  CheckCircle2, ShieldOff, ShieldCheck, User,
  Mail, Briefcase, KeyRound, Lock, Phone, Calendar, AtSign, Car, Eye, EyeOff,
  Camera, Image,
} from 'lucide-react';
import { toast } from 'sonner';
import { staffService, Staff as BackendStaff } from '../staffService';

// ─── Types ─────────────────────────────────────────────────────────────────

type AccessLevel = 'admin' | 'manager' | 'operator' | 'viewer' | 'custom';
type PermissionId =
  | 'dashboard' | 'analytics' | 'reports-admin' | 'reports-staff'
  | 'tickets' | 'member-management' | 'staff-management' | 'parking-slots'
  | 'settings-general' | 'settings-security' | 'settings-parking-slots'
  | 'settings-access-control' | 'settings-profile' | 'settings-password';

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

// ─── Constants ─────────────────────────────────────────────────────────────

const ACCESS_LEVELS: { value: AccessLevel; label: string; desc: string; color: string; bg: string; border: string }[] = [
  { value: 'admin',    label: 'Admin',    desc: 'Full system access',            color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  { value: 'manager',  label: 'Manager',  desc: 'Manage zones & view reports',   color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30'   },
  { value: 'operator', label: 'Operator', desc: 'Toggle slots & view dashboard', color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  { value: 'viewer',   label: 'Viewer',   desc: 'Read-only access',              color: 'text-gray-400',   bg: 'bg-gray-400/10',   border: 'border-gray-400/30'   },
  { value: 'custom',   label: 'Custom',   desc: 'Pick individual permissions',   color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
];

const GENDER_OPTIONS   = ['Male', 'Female', 'Other', 'Prefer not to say'];
const VEHICLE_TYPES    = ['Sedan', 'SUV', 'EV', 'Motorcycle', 'Truck', 'Coupe', 'Van', 'Accessible'];
const VEHICLE_COLORS   = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Other'];

const PERMISSION_GROUPS = [
  {
    group: 'General',
    items: [
      { id: 'dashboard'      as PermissionId, label: 'Dashboard'       },
      { id: 'analytics'      as PermissionId, label: 'Analytics'       },
      { id: 'reports-admin'  as PermissionId, label: 'Reports – Admin' },
      { id: 'reports-staff'  as PermissionId, label: 'Reports – Staff' },
      { id: 'tickets'        as PermissionId, label: 'Tickets'         },
    ],
  },
  {
    group: 'Management',
    items: [
      { id: 'member-management'  as PermissionId, label: 'Member Management' },
      { id: 'staff-management'   as PermissionId, label: 'Staff Management'  },
      { id: 'parking-slots'      as PermissionId, label: 'Parking Slots'     },
    ],
  },
  {
    group: 'Settings',
    items: [
      { id: 'settings-general'        as PermissionId, label: 'General Settings'  },
      { id: 'settings-security'       as PermissionId, label: 'Security Settings' },
      { id: 'settings-parking-slots'  as PermissionId, label: 'Slot Settings'     },
      { id: 'settings-access-control' as PermissionId, label: 'Access Control'    },
      { id: 'settings-profile'        as PermissionId, label: 'Profile'           },
      { id: 'settings-password'       as PermissionId, label: 'Security'          },
    ],
  },
];

function levelFor(v: AccessLevel) { return ACCESS_LEVELS.find(l => l.value === v) ?? ACCESS_LEVELS[3]; }
function initials(name: string)   { return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(); }
const AVATAR_COLORS = ['bg-blue-600','bg-violet-600','bg-emerald-600','bg-rose-600','bg-amber-600','bg-cyan-600','bg-indigo-600'];
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

// ─── Delete confirm ─────────────────────────────────────────────────────────

function DeleteConfirm({ member, onConfirm, onClose }: { member: StaffMember; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="font-semibold mb-1">Remove Staff Member</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to remove <span className="font-medium text-foreground">{member.name}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Remove</button>
        </div>
      </div>
    </div>
  );
}

// ─── Staff Modal ────────────────────────────────────────────────────────────

function StaffModal({ initial, onSave, onClose, isNew }: {
  initial: StaffMember;
  onSave: (s: StaffMember, avatarFile: File | null) => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<StaffMember>(initial);
  const set = (patch: Partial<StaffMember>) => setForm(prev => ({ ...prev, ...patch }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatar || null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name     = 'Full name is required.';
    if (!form.username.trim()) e.username = 'Username is required.';
    else if (/\s/.test(form.username)) e.username = 'Username cannot contain spaces.';
    if (!form.email.trim())    e.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email.';
    if (!form.role.trim())     e.role     = 'Job title is required.';
    if (isNew && !form.password?.trim()) e.password = 'Password is required.';
    else if (isNew && (form.password?.length ?? 0) < 6) e.password = 'Password must be at least 6 characters.';
    if (form.hasVehicle && !form.vehiclePlate?.trim()) e.vehiclePlate = 'Plate number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    set({ avatar: file.name });
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    set({ avatar: '' });
  };

  const togglePermission = (id: PermissionId) => {
    set({ permissions: form.permissions.includes(id)
      ? form.permissions.filter(p => p !== id)
      : [...form.permissions, id] });
  };

  const field = (label: string, key: keyof StaffMember, placeholder = '', icon?: React.ReactNode, type = 'text') => (
    <div>
      <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type}
          value={String(form[key] ?? '')}
          onChange={e => set({ [key]: e.target.value } as Partial<StaffMember>)}
          placeholder={placeholder}
          className={`w-full bg-background text-foreground rounded-xl py-2.5 outline-none border transition-colors placeholder:text-muted-foreground text-sm ${icon ? 'pl-9 pr-4' : 'px-4'} ${errors[key] ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
        />
      </div>
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold">{isNew ? 'Add Staff Member' : 'Edit Staff Member'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{isNew ? 'Create a new staff account.' : 'Update details and permissions.'}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* ── Identity ── */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Identity</p>
            <div className="grid grid-cols-2 gap-3">
              {field('Full Name',    'name',     'e.g. Jordan Lee',      <User className="w-3.5 h-3.5" />)}
              {field('Username',     'username', 'e.g. jordan.lee',      <AtSign className="w-3.5 h-3.5" />)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field('Job Title',    'role',     'e.g. Shift Operator',  <Briefcase className="w-3.5 h-3.5" />)}
              {field('Phone',        'phone',    '+94 77 000 0000',       <Phone className="w-3.5 h-3.5" />)}
            </div>
            {field('Email Address', 'email', 'email@parkpulse.io', <Mail className="w-3.5 h-3.5" />)}

            {/* Avatar */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold border border-border">
                      {form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center cursor-pointer transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {avatarPreview && (
                    <button type="button" onClick={removeAvatar} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xs transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>JPG, PNG up to 2MB</span>
                  <span className="text-muted-foreground/50">Click camera icon to upload</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">
                {isNew ? <>Password <span className="text-red-500">*</span></> : 'New Password'}
                {!isNew && <span className="ml-1 text-muted-foreground/50 text-xs">(leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password ?? ''}
                  onChange={e => set({ password: e.target.value })}
                  placeholder={isNew ? 'Min. 6 characters' : '••••••••'}
                  className={`w-full bg-background text-foreground rounded-xl pl-9 pr-10 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.password ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
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

          {/* ── Personal details ── */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Personal Details</p>
            <div className="grid grid-cols-2 gap-3">
              {/* DOB */}
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Date of Birth</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={form.dob ?? ''}
                    onChange={e => set({ dob: e.target.value })}
                    className="w-full bg-background text-foreground rounded-xl pl-9 pr-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Gender</label>
                <select
                  value={form.gender ?? ''}
                  onChange={e => set({ gender: e.target.value })}
                  className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Access level ── */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Access Level</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ACCESS_LEVELS.map(lvl => (
                <button
                  key={lvl.value}
                  onClick={() => set({ access: lvl.value })}
                  className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all text-sm ${
                    form.access === lvl.value
                      ? `${lvl.bg} ${lvl.border} ${lvl.color} ring-1 ring-current`
                      : 'border-border hover:border-blue-500/30 bg-card'
                  }`}
                >
                  <span className="font-medium">{lvl.label}</span>
                  <span className="text-[10px] opacity-70 leading-tight">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Custom permissions ── */}
          {form.access === 'custom' && (
            <div className="bg-background border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-violet-500" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Custom Permissions</p>
              </div>
              {PERMISSION_GROUPS.map(group => (
                <div key={group.group}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">{group.group}</p>
                  <div className="space-y-1.5">
                    {group.items.map(item => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => togglePermission(item.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            form.permissions.includes(item.id) ? 'bg-violet-500 border-violet-500' : 'border-border group-hover:border-violet-400'
                          }`}
                        >
                          {form.permissions.includes(item.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Vehicle ── */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Vehicle</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{form.hasVehicle ? 'Has vehicle' : 'No vehicle'}</span>
                <div
                  onClick={() => set({ hasVehicle: !form.hasVehicle, ...(!form.hasVehicle ? {} : { vehiclePlate: '', vehicleType: '', vehicleMake: '', vehicleColor: '' }) })}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${form.hasVehicle ? 'bg-blue-600' : 'bg-muted border border-border'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${form.hasVehicle ? 'right-0.5 bg-white' : 'left-0.5 bg-muted-foreground'}`} />
                </div>
              </div>
            </div>

            {form.hasVehicle && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Plate Number <span className="text-red-500">*</span></label>
                    <input
                      value={form.vehiclePlate ?? ''}
                      onChange={e => set({ vehiclePlate: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABC-1234"
                      className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm transition-colors placeholder:text-muted-foreground ${errors.vehiclePlate ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
                    />
                    {errors.vehiclePlate && <p className="mt-1 text-xs text-red-500">{errors.vehiclePlate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Vehicle Type</label>
                    <select
                      value={form.vehicleType ?? ''}
                      onChange={e => set({ vehicleType: e.target.value })}
                      className="w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none"
                    >
                      <option value="">Select type</option>
                      {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Make / Model</label>
                    <input
                      value={form.vehicleMake ?? ''}
                      onChange={e => set({ vehicleMake: e.target.value })}
                      placeholder="e.g. Toyota Corolla"
                      className="w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Colour</label>
                    <select
                      value={form.vehicleColor ?? ''}
                      onChange={e => set({ vehicleColor: e.target.value })}
                      className="w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none"
                    >
                      <option value="">Select colour</option>
                      {VEHICLE_COLORS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Active toggle ── */}
          <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Account Active</p>
              <p className="text-xs text-muted-foreground mt-0.5">Inactive accounts cannot log in.</p>
            </div>
            <div onClick={() => set({ active: !form.active })}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.active ? 'bg-blue-600' : 'bg-muted border border-border'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${form.active ? 'right-1 bg-white' : 'left-1 bg-muted-foreground'}`} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
          <button
            onClick={() => { if (validate()) onSave(form, avatarFile); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium btn-glow active:scale-95"
          >
            {isNew ? <><Plus className="w-4 h-4" />Add Staff</> : <><CheckCircle2 className="w-4 h-4" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ──────────────────────────────────────────────────────────────

export function StaffView({ staff, setStaff }: {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}) {
  const [search, setSearch]             = useState('');
  const [filterAccess, setFilterAccess] = useState<AccessLevel | 'all'>('all');
  const [modal, setModal]               = useState<{ mode: 'add' | 'edit'; member: StaffMember } | null>(null);
  const [toDelete, setToDelete]         = useState<StaffMember | null>(null);

  const counts = {
    all:      staff.length,
    active:   staff.filter(s => s.active).length,
    inactive: staff.filter(s => !s.active).length,
  };

  const filtered = useMemo(() => {
    return staff.filter(s => {
      const q = search.toLowerCase();
      const matchQ = !search ||
        s.name.toLowerCase().includes(q) ||
        s.username?.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q);
      const matchAccess = filterAccess === 'all' || s.access === filterAccess;
      return matchQ && matchAccess;
    });
  }, [staff, search, filterAccess]);

  const blankMember = (): StaffMember => ({
    id: '', name: '', username: '', email: '', phone: '', dob: '', gender: '',
    role: '', access: 'operator', permissions: [], active: true,
    hasVehicle: false, vehiclePlate: '', vehicleType: '', vehicleMake: '', vehicleColor: '', password: '',
  });

  const save = async (s: StaffMember, avatarFile: File | null) => {
    try {
      // Convert frontend StaffMember to backend Staff format
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
        joinDate: s.dob, // dob maps to joinDate
        address: '',
        vehicleNumber: s.vehiclePlate,
        vehicleType: s.vehicleType,
        shift: '',
        status: s.active ? 'Active' : 'Inactive',
      };

      // If there's an avatar file, use multipart form data
      if (avatarFile) {
        const formData = new FormData();
        Object.entries(staffData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        formData.append('image', avatarFile);

        if (modal?.mode === 'add') {
          const saved = await staffService.saveStaffWithImage(formData);
          const newStaff: StaffMember = { ...s, id: saved.id, avatar: saved.avatar };
          setStaff(prev => [...prev, newStaff]);
          toast.success('Staff member added', { description: `${s.name} (@${s.username}) added as ${levelFor(s.access).label}.` });
        } else {
          const saved = await staffService.updateStaffWithImage(s.id, formData);
          const updatedStaff: StaffMember = { ...s, avatar: saved.avatar };
          setStaff(prev => prev.map(x => x.id === s.id ? updatedStaff : x));
          toast.success('Staff member updated', { description: `${s.name}'s details have been saved.` });
        }
      } else {
        // Regular JSON request
        if (modal?.mode === 'add') {
          const saved = await staffService.saveStaff(staffData);
          const newStaff: StaffMember = { ...s, id: saved.id, avatar: saved.avatar };
          setStaff(prev => [...prev, newStaff]);
          toast.success('Staff member added', { description: `${s.name} (@${s.username}) added as ${levelFor(s.access).label}.` });
        } else {
          const saved = await staffService.updateStaff(s.id, staffData);
          const updatedStaff: StaffMember = { ...s, avatar: saved.avatar };
          setStaff(prev => prev.map(x => x.id === s.id ? updatedStaff : x));
          toast.success('Staff member updated', { description: `${s.name}'s details have been saved.` });
        }
      }
      setModal(null);
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
      setToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete staff member');
    }
  };

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

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setModal({ mode: 'add', member: blankMember() })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium btn-glow active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Staff',   value: counts.all,          color: 'text-blue-500',    bg: 'bg-blue-500/10',    Icon: Shield      },
          { label: 'Active',        value: counts.active,       color: 'text-emerald-500', bg: 'bg-emerald-500/10', Icon: ShieldCheck  },
          { label: 'Inactive',      value: counts.inactive,     color: 'text-red-500',     bg: 'bg-red-500/10',     Icon: ShieldOff    },
          { label: 'Access Levels', value: ACCESS_LEVELS.length, color: 'text-violet-500', bg: 'bg-violet-500/10',  Icon: Lock         },
        ].map(({ label, value, color, bg, Icon }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover-lift">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, @username, email, phone…"
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
          {search && <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {([{ value: 'all', label: 'All' }, ...ACCESS_LEVELS.map(l => ({ value: l.value, label: l.label }))] as { value: AccessLevel | 'all'; label: string }[]).map(({ value, label }) => (
            <button key={value} onClick={() => setFilterAccess(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterAccess === value ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <div style={{ minWidth: '1080px' }}>
        <div className="grid grid-cols-[220px_140px_180px_130px_160px_110px_110px_96px] gap-0 px-6 py-3 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Staff Member</span>
          <span>Username</span>
          <span>Contact</span>
          <span>Personal</span>
          <span>Vehicle</span>
          <span>Access</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                {search || filterAccess !== 'all' ? 'No staff match your filters.' : 'No staff members yet.'}
              </p>
              {!search && filterAccess === 'all' && (
                <button onClick={() => setModal({ mode: 'add', member: blankMember() })}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Add Staff
                </button>
              )}
            </div>
          ) : filtered.map(member => {
            const lvl = levelFor(member.access);
            return (
              <div
                key={member.id}
                onClick={() => setModal({ mode: 'edit', member: { ...member } })}
                className="grid grid-cols-[220px_140px_180px_130px_160px_110px_110px_96px] gap-0 px-6 py-4 items-center hover:bg-muted/20 cursor-pointer hover-row group"
              >
                {/* Name + role */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarColor(member.name)} ${!member.active ? 'opacity-50' : ''}`}>
                    {initials(member.name)}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium text-sm truncate ${!member.active ? 'text-muted-foreground' : ''}`}>{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role || '—'}</p>
                  </div>
                </div>

                {/* Username */}
                <div className="min-w-0">
                  {member.username ? (
                    <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground">
                      <AtSign className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{member.username}</span>
                    </div>
                  ) : <span className="text-xs text-muted-foreground/50">—</span>}
                </div>

                {/* Contact */}
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  {member.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{member.phone}</span>
                    </div>
                  )}
                </div>

                {/* Personal (DOB + gender) */}
                <div className="min-w-0 space-y-0.5">
                  {member.dob && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{new Date(member.dob).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  {member.gender && (
                    <p className="text-xs text-muted-foreground">{member.gender}</p>
                  )}
                  {!member.dob && !member.gender && <span className="text-xs text-muted-foreground/50">—</span>}
                </div>

                {/* Vehicle */}
                <div className="min-w-0">
                  {member.hasVehicle && member.vehiclePlate ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-mono font-semibold truncate">{member.vehiclePlate}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {[member.vehicleType, member.vehicleColor].filter(Boolean).join(' · ')}
                      </p>
                      {member.vehicleMake && <p className="text-xs text-muted-foreground/60 truncate">{member.vehicleMake}</p>}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">No vehicle</span>
                  )}
                </div>

                {/* Access badge */}
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium w-fit ${lvl.bg} ${lvl.color} ${lvl.border}`}>
                  <Shield className="w-3 h-3" />{lvl.label}
                </span>

                {/* Status */}
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium w-fit ${
                  member.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {member.active ? <><CheckCircle2 className="w-3 h-3" />Active</> : <><ShieldOff className="w-3 h-3" />Inactive</>}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button title="Edit" onClick={() => setModal({ mode: 'edit', member: { ...member } })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button title={member.active ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(member.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    {member.active ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  </button>
                  <button title="Remove" onClick={() => setToDelete(member)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        </div>{/* min-width wrapper */}
        </div>{/* overflow-x-auto */}

        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground bg-muted/10 flex justify-between">
            <span>Showing {filtered.length} of {staff.length} staff member{staff.length !== 1 ? 's' : ''}</span>
            <span>{counts.active} active · {counts.inactive} inactive</span>
          </div>
        )}
      </div>

      {modal && <StaffModal initial={modal.member} onSave={save} onClose={() => setModal(null)} isNew={modal.mode === 'add'} />}
      {toDelete && <DeleteConfirm member={toDelete} onConfirm={() => remove(toDelete.id)} onClose={() => setToDelete(null)} />}
    </div>
  );
}

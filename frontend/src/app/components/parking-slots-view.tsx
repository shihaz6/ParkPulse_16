import { useState, useMemo, useEffect } from 'react';
import {
  MapPin, Car, Search, Plus, ChevronLeft, ChevronRight,
  BarChart2, Clock, TrendingUp, X, CheckCircle2, Wrench,
  Phone, User, FileText, LogOut, AlertTriangle, Users, Shield,
  BookMarked, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { parkingService, ParkingSlot as BackendParkingSlot, ParkingSession } from '../parkingService';
import { reservationService } from '../reservationService';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Zone {
  id: string;
  name: string;
  prefix: string;
  totalSlots: number;
  reservedSlots: number;
  ratePerHour?: string;
  color: string;
  status: 'active' | 'inactive' | 'maintenance';
}

type SlotStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

interface SlotEntry {
  id: string;
  status: SlotStatus;
  plate?: string;
  vehicleType?: string;
  ownerName?: string;
  phone?: string;
  notes?: string;
  entryTime?: Date;
  reservedFor?: string;
  reservedForType?: 'member' | 'staff';
  reservedForEmail?: string;
  entryType?: 'walkin' | 'member' | 'staff';
  reservationId?: string;
}

interface PersonOption {
  id: string;
  name: string;
  email: string;
  role?: string;
  plan?: string;
  vehicleType?: string;
}

const VEHICLE_TYPES = ['Sedan', 'SUV', 'EV', 'Motorcycle', 'Truck', 'Coupe', 'Van', 'Accessible'];

const COLOR_MAP: Record<string, { bar: string; text: string; light: string }> = {
  blue:   { bar: 'bg-blue-500',    text: 'text-blue-500',    light: 'bg-blue-500/10'    },
  purple: { bar: 'bg-purple-500',  text: 'text-purple-500',  light: 'bg-purple-500/10'  },
  green:  { bar: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-500/10' },
  orange: { bar: 'bg-orange-500',  text: 'text-orange-500',  light: 'bg-orange-500/10'  },
  pink:   { bar: 'bg-pink-500',    text: 'text-pink-500',    light: 'bg-pink-500/10'    },
  teal:   { bar: 'bg-teal-500',    text: 'text-teal-500',    light: 'bg-teal-500/10'    },
};
function colorOf(c: string) { return COLOR_MAP[c] ?? COLOR_MAP['blue']; }

function timeSince(d: Date) {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function slotBg(status: SlotStatus) {
  if (status === 'occupied')    return 'bg-red-500 hover:bg-red-600';
  if (status === 'maintenance') return 'bg-yellow-400 hover:bg-yellow-500';
  if (status === 'reserved')    return 'bg-amber-500 hover:bg-amber-600';
  return 'bg-emerald-500 hover:bg-emerald-600';
}

function initSlots(zone: Zone): SlotEntry[] {
  return Array.from({ length: zone.totalSlots }, (_, i) => ({
    id: `${zone.prefix}${i + 1}`,
    status: 'available' as SlotStatus,
  }));
}

// ─── Slot Dialog ───────────────────────────────────────────────────────────

type AvailableTab = 'park' | 'member' | 'staff';

function SlotDialog({
  slot, zone, onClose, onPark, onRelease, onSetMaintenance, onClearMaintenance,
  onReserve,
  onOpenCheckIn,
  onReleaseReservation,
  members, staff,
  isMember, profileName, memberEmail,
}: {
  slot: SlotEntry;
  zone: Zone;
  onClose: () => void;
  onPark: (data: Partial<SlotEntry>) => void;
  onRelease: () => void;
  onSetMaintenance: (notes: string) => void;
  onClearMaintenance: () => void;
  onReserve: (data: Partial<SlotEntry>) => void;
  onOpenCheckIn: (slot: SlotEntry) => void;
  onReleaseReservation: () => void;
  members: PersonOption[];
  staff: PersonOption[];
  isMember?: boolean;
  profileName?: string;
  memberEmail?: string;
}) {
  const [tab, setTab]           = useState<AvailableTab>('park');
  const [plate, setPlate]       = useState('');
  const [vType, setVType]       = useState('Sedan');
  const [owner, setOwner]       = useState('');
  const [phone, setPhone]       = useState('');
  const [notes, setNotes]       = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [mainNotes, setMainNotes] = useState(slot.notes ?? '');

  // Entry type for Park Vehicle tab: walkin | member | staff
  const [entryType, setEntryType] = useState<'walkin' | 'member' | 'staff'>('walkin');
  const [selectedPerson, setSelectedPerson] = useState<PersonOption | null>(null);
  const [searchPerson, setSearchPerson] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!plate.trim()) e.plate = 'Plate number is required.';
    if (entryType !== 'walkin' && !selectedPerson) {
      e.person = `Please select a ${entryType}.`;
    } else if (entryType === 'walkin' && !owner.trim()) {
      e.owner = 'Owner name is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const statusColor =
    slot.status === 'occupied'    ? 'bg-red-500'     :
    slot.status === 'maintenance' ? 'bg-yellow-400'  :
    slot.status === 'reserved'    ? 'bg-amber-500'   : 'bg-emerald-500';

  const statusLabel =
    slot.status === 'occupied'    ? 'Occupied'    :
    slot.status === 'maintenance' ? 'Maintenance' :
    slot.status === 'reserved'    ? 'Reserved'    : 'Available';

  const statusBadge =
    slot.status === 'occupied'    ? 'bg-red-500/10 text-red-500 border-red-500/20'       :
    slot.status === 'maintenance' ? 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20' :
    slot.status === 'reserved'    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

  const currentMember = members.find(m => m.email === memberEmail || m.name === profileName);
  const memberVehicleType = currentMember?.vehicleType || 'Sedan';
  const parkPersonList = entryType === 'member' ? members : staff;
  const reserveTab = tab === 'park' ? entryType : tab;
  const personList = reserveTab === 'member' ? members : (reserveTab === 'staff' ? staff : []);
  const filteredPersons = searchPerson
    ? personList.filter(p => p.name.toLowerCase().includes(searchPerson.toLowerCase()) || p.email.toLowerCase().includes(searchPerson.toLowerCase()))
    : personList;

  const onPersonSelect = (person: PersonOption) => {
    setSelectedPerson(person);
    setOwner(person.name);
    setPhone(person.email || '');
    setSearchPerson('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${statusColor} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
              {slot.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Slot {slot.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge}`}>{statusLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{zone.name.split('—')[0].trim()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* ── AVAILABLE: tabs ────────────────────────────────────── */}
          {slot.status === 'available' && (
            <>
              {isMember ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Plate Number <span className="text-red-500">*</span></label>
                    <input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="Enter your vehicle plate number"
                      className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm font-mono transition-colors placeholder:text-muted-foreground ${errors.plate ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                    {errors.plate && <p className="mt-1 text-xs text-red-500">{errors.plate}</p>}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
                    <button
                      onClick={() => {
                        const e: Record<string, string> = {};
                        if (!plate.trim()) e.plate = 'Plate number is required.';
                        setErrors(e);
                        if (Object.keys(e).length > 0) return;
                        onPark({
                          plate: plate.trim(),
                          vehicleType: memberVehicleType,
                          ownerName: profileName || '',
                          phone: memberEmail || '',
                          entryType: 'member',
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                    >
                      <Car className="w-4 h-4" /> Park Vehicle
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Tab bar */}
                  <div className="flex gap-1 bg-muted rounded-xl p-1 border border-border">
                    {([
                      { key: 'park',   label: 'Park Vehicle',         Icon: Car         },
                      { key: 'member', label: 'Reserve for Member',   Icon: Users       },
                      { key: 'staff',  label: 'Reserve for Staff',    Icon: Shield      },
                    ] as { key: AvailableTab; label: string; Icon: typeof Car }[]).map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        onClick={() => { setTab(key); setSelectedPerson(null); setSearchPerson(''); setErrors({}); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          tab === key ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />{label}
                      </button>
                    ))}
                  </div>

                  {/* ── TAB: Park Vehicle ── */}
                  {tab === 'park' && (
                    <>
                      <div className="flex gap-1 bg-muted rounded-xl p-1 border border-border">
                        {([
                          { key: 'walkin' as const, label: 'Walk-in', Icon: Car },
                          { key: 'member' as const, label: 'Member', Icon: Users },
                          { key: 'staff' as const, label: 'Staff', Icon: Shield },
                        ]).map(({ key, label, Icon }) => (
                          <button
                            key={key}
                            onClick={() => { setEntryType(key); setSelectedPerson(null); setSearchPerson(''); setErrors({}); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                              entryType === key ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />{label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1.5">Plate Number <span className="text-red-500">*</span></label>
                          <input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="e.g. ABC-1234"
                            className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm font-mono transition-colors placeholder:text-muted-foreground ${errors.plate ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                          {errors.plate && <p className="mt-1 text-xs text-red-500">{errors.plate}</p>}
                        </div>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1.5">Vehicle Type</label>
                          <select value={vType} onChange={e => setVType(e.target.value)}
                            className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none">
                            {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>

                        {entryType === 'walkin' && (
                          <>
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1.5">Owner Name <span className="text-red-500">*</span></label>
                              <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. Sarah Fernando"
                                className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.owner ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                              {errors.owner && <p className="mt-1 text-xs text-red-500">{errors.owner}</p>}
                            </div>
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1.5">Phone</label>
                              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+94 77 000 0000"
                                className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm placeholder:text-muted-foreground" />
                            </div>
                          </>
                        )}

                        {entryType !== 'walkin' && (
                          <>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border ${entryType === 'member' ? 'bg-violet-500/5' : 'bg-blue-500/5'}`}>
                              {entryType === 'member'
                                ? <Users className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                : <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                              <input
                                value={searchPerson}
                                onChange={e => { setSearchPerson(e.target.value); setSelectedPerson(null); }}
                                placeholder={`Search ${entryType === 'member' ? 'members' : 'staff'}…`}
                                className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                              />
                            </div>

                            {filteredPersons.length === 0 && searchPerson ? (
                              <p className="text-center text-sm text-muted-foreground py-4">
                                No {entryType === 'member' ? 'members' : 'staff'} found.
                              </p>
                            ) : filteredPersons.length > 0 && entryType !== 'walkin' && (
                              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                                {filteredPersons.map(person => {
                                  const ini = person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                                  const selected = selectedPerson?.id === person.id;
                                  return (
                                    <button
                                      key={person.id}
                                      onClick={() => onPersonSelect(person)}
                                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                        selected
                                          ? entryType === 'member'
                                            ? 'bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/20'
                                            : 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
                                          : 'border-border hover:bg-muted/50'
                                      }`}
                                    >
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${entryType === 'member' ? 'bg-violet-600' : 'bg-blue-600'}`}>
                                        {ini}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{person.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{person.email}{person.role ? ` · ${person.role}` : ''}{person.plan ? ` · ${person.plan}` : ''}</p>
                                      </div>
                                      {selected && <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${entryType === 'member' ? 'text-violet-500' : 'text-blue-500'}`} />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {errors.person && <p className="text-xs text-red-500">{errors.person}</p>}
                          </>
                        )}

                        <div>
                          <label className="block text-sm text-muted-foreground mb-1.5">Notes</label>
                          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes…" rows={2}
                            className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm placeholder:text-muted-foreground resize-none" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
                        <button onClick={() => { if (!validate()) return; onPark({ plate: plate.trim(), vehicleType: vType, ownerName: owner.trim(), phone: phone.trim(), notes: notes.trim(), entryType }); }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
                          <Car className="w-4 h-4" /> Park Vehicle
                        </button>
                      </div>
                      <button onClick={() => onSetMaintenance('')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-yellow-400/40 text-yellow-500 hover:bg-yellow-400/10 text-sm transition-colors">
                        <Wrench className="w-4 h-4" /> Mark as Maintenance
                      </button>
                    </>
                  )}

                  {/* ── TAB: Reserve for Member / Staff ── */}
                  {(tab === 'member' || tab === 'staff') && (
                    <>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border ${tab === 'member' ? 'bg-violet-500/5' : 'bg-blue-500/5'}`}>
                        {tab === 'member'
                          ? <Users className="w-4 h-4 text-violet-500 flex-shrink-0" />
                          : <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        <input
                          value={searchPerson}
                          onChange={e => { setSearchPerson(e.target.value); setSelectedPerson(null); }}
                          placeholder={`Search ${tab === 'member' ? 'members' : 'staff'}…`}
                          className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                        />
                      </div>

                      {filteredPersons.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-6">
                          No {tab === 'member' ? 'members' : 'staff'} found.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto">
                          {filteredPersons.map(person => {
                            const ini = person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                            const selected = selectedPerson?.id === person.id;
                            return (
                              <button
                                key={person.id}
                                onClick={() => setSelectedPerson(selected ? null : person)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                  selected
                                    ? tab === 'member'
                                      ? 'bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/20'
                                      : 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
                                    : 'border-border hover:bg-muted/50'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${tab === 'member' ? 'bg-violet-600' : 'bg-blue-600'}`}>
                                  {ini}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{person.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{person.email}{person.role ? ` · ${person.role}` : ''}{person.plan ? ` · ${person.plan}` : ''}</p>
                                </div>
                                {selected && <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${tab === 'member' ? 'text-violet-500' : 'text-blue-500'}`} />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {errors.person && <p className="text-xs text-red-500">{errors.person}</p>}

                      <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
                        <button
                          onClick={() => {
                            if (!selectedPerson) { setErrors({ person: `Select a ${tab} to reserve for.` }); return; }
                            onReserve({
                              reservedFor: selectedPerson.name,
                              reservedForType: tab as 'member' | 'staff',
                              reservedForEmail: selectedPerson.email,
                              vehicleType: selectedPerson.vehicleType,
                              notes: `Reserved for ${selectedPerson.name}`,
                            });
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${
                            tab === 'member' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <BookMarked className="w-4 h-4" /> Reserve Slot
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ── RESERVED: show reservation info ────────────────────── */}
          {slot.status === 'reserved' && (
            <>
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                slot.reservedForType === 'staff' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-violet-500/5 border-violet-500/20'
              }`}>
                {slot.reservedForType === 'staff'
                  ? <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  : <Users className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className={`font-medium text-sm ${slot.reservedForType === 'staff' ? 'text-blue-500' : 'text-violet-500'}`}>
                    Reserved for {slot.reservedForType === 'staff' ? 'Staff' : 'Member'}
                  </p>
                  <p className="text-sm font-semibold mt-0.5">{slot.reservedFor}</p>
                  {slot.reservedForEmail && <p className="text-xs text-muted-foreground mt-0.5">{slot.reservedForEmail}</p>}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Close</button>
                <button 
                  onClick={() => { if (onOpenCheckIn) onOpenCheckIn(slot); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
                  <Car className="w-4 h-4" /> Check-in Vehicle
                </button>
                <button onClick={onReleaseReservation}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                  <LogOut className="w-4 h-4" /> Release Reservation
                </button>
              </div>
            </>
          )}

          {/* ── OCCUPIED: show details + release ─────────────────── */}
          {slot.status === 'occupied' && (
            <>
              <div className="bg-background rounded-xl border border-border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Plate</p>
                    <p className="font-mono font-bold">{slot.plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Vehicle Type</p>
                    <p className="font-medium">{slot.vehicleType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Owner</p>
                      <p className="text-sm">{slot.ownerName ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                      <p className="text-sm">{slot.phone ?? '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">Parked</p>
                  <p className="text-sm font-medium ml-1">{slot.entryTime ? timeSince(slot.entryTime) : '—'}</p>
                </div>
                {slot.notes && (
                  <div className="flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{slot.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Close</button>
                <button
                  onClick={onRelease}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Release Slot
                </button>
              </div>
            </>
          )}

          {/* ── MAINTENANCE ──────────────────────────────────────── */}
          {slot.status === 'maintenance' && (
            <>
              <div className="flex items-start gap-3 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                <Wrench className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-500 text-sm">Under Maintenance</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{slot.notes || 'No additional notes.'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Update Notes</label>
                <textarea
                  value={mainNotes} onChange={e => setMainNotes(e.target.value)}
                  placeholder="Describe the maintenance work…"
                  rows={2}
                  className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Close</button>
                <button
                  onClick={onClearMaintenance}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Available
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Check-in Dialog ─────────────────────────────────────────────────────────

function CheckInDialog({ slot, person, onCheckIn, onClose }: {
  slot: SlotEntry;
  person: PersonOption;
  onCheckIn: (plate: string, vehicleType: string) => void;
  onClose: () => void;
}) {
  const [plate, setPlate] = useState('');
  const [vType, setVType] = useState('Sedan');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Default vehicle type to person's vehicle if they have one
  const personVehicleType = person.vehicleType || person.role?.includes('EV') ? 'EV' : 'Sedan';

  useEffect(() => {
    setVType(personVehicleType);
  }, [personVehicleType]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!plate.trim()) e.plate = 'Plate number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onCheckIn(plate.trim().toUpperCase(), vType);
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to check in' });
    } finally {
      setLoading(false);
    }
  };

  const ini = person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center text-sm font-bold text-violet-500">
              {ini}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Check-in Vehicle</span>
                <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-violet-500/10 text-violet-500 border-violet-500/20">
                  {slot.reservedForType === 'staff' ? 'Staff' : 'Member'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Slot {slot.id} reserved for {person.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Person info */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${slot.reservedForType === 'staff' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-violet-500/5 border-violet-500/20'}`}>
            {slot.reservedForType === 'staff'
              ? <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              : <Users className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${slot.reservedForType === 'staff' ? 'text-blue-500' : 'text-violet-500'}`}>
                Reserved for {slot.reservedForType === 'staff' ? 'Staff' : 'Member'}
              </p>
              <p className="text-sm font-semibold mt-0.5">{person.name}</p>
              {person.email && <p className="text-xs text-muted-foreground mt-0.5">{person.email}</p>}
            </div>
          </div>

          {/* Vehicle info form */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Plate Number <span className="text-red-500">*</span></label>
              <input
                value={plate}
                onChange={e => setPlate(e.target.value.toUpperCase())}
                placeholder="e.g. ABC-1234"
                className={`w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm font-mono transition-colors placeholder:text-muted-foreground ${errors.plate ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
                autoFocus
              />
              {errors.plate && <p className="mt-1 text-xs text-red-500">{errors.plate}</p>}
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Vehicle Type</label>
              <select
                value={vType}
                onChange={e => setVType(e.target.value)}
                className="w-full bg-background text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none"
              >
                {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {errors.submit && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errors.submit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {loading
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Checking in…</>
              : <><Car className="w-4 h-4" />Check-in Vehicle</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Entry Modal ────────────────────────────────────────────────────────

function NewEntryModal({
  zones,
  allZoneSlots,
  onClose,
  onPark,
  members, staff,
}: {
  zones: Zone[];
  allZoneSlots: SlotEntry[][];
  onClose: () => void;
  onPark: (zoneIdx: number, slotId: string, data: Partial<SlotEntry>) => void;
  members: PersonOption[];
  staff: PersonOption[];
}) {
  const [zoneIdx, setZoneIdx]   = useState(0);
  const [slotId, setSlotId]     = useState('');
  const [plate, setPlate]       = useState('');
  const [vType, setVType]       = useState('Sedan');
  const [owner, setOwner]       = useState('');
  const [phone, setPhone]       = useState('');
  const [notes, setNotes]       = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [success, setSuccess]   = useState(false);

  const [entryType, setEntryType] = useState<'walkin' | 'member' | 'staff'>('walkin');
  const [selectedPerson, setSelectedPerson] = useState<PersonOption | null>(null);
  const [searchPerson, setSearchPerson] = useState('');

  const availableSlots = allZoneSlots[zoneIdx]?.filter(s => s.status === 'available') ?? [];

  const personList = entryType === 'member' ? members : (entryType === 'staff' ? staff : []);
  const filteredPersons = searchPerson
    ? personList.filter(p => p.name.toLowerCase().includes(searchPerson.toLowerCase()) || p.email.toLowerCase().includes(searchPerson.toLowerCase()))
    : personList;

  const onPersonSelect = (person: PersonOption) => {
    setSelectedPerson(person);
    setOwner(person.name);
    setPhone(person.email || '');
    setSearchPerson('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!slotId)       e.slot  = 'Please select a slot.';
    if (!plate.trim()) e.plate = 'Plate number is required.';
    if (entryType !== 'walkin' && !selectedPerson) {
      e.person = `Please select a ${entryType}.`;
    } else if (entryType === 'walkin' && !owner.trim()) {
      e.owner = 'Owner name is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onPark(zoneIdx, slotId, { plate: plate.trim(), vehicleType: vType, ownerName: owner.trim(), phone: phone.trim(), notes: notes.trim(), entryType });
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold">New Entry</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Select a slot and fill in vehicle details.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {success ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-semibold">Vehicle Parked!</p>
              <p className="text-sm text-muted-foreground">Slot {slotId} is now occupied.</p>
            </div>
          ) : (
            <>
              {/* Zone + Slot pickers */}
              <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Slot Assignment</p>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Zone</label>
                  <select
                    value={zoneIdx}
                    onChange={e => { setZoneIdx(Number(e.target.value)); setSlotId(''); }}
                    className="w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none"
                  >
                    {zones.map((z, i) => (
                      <option key={z.id} value={i}>{z.name.split('—')[0].trim()} — {allZoneSlots[i]?.filter(s => s.status === 'available').length ?? 0} free</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Available Slot <span className="text-red-500">*</span></label>
                  {availableSlots.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
                      <AlertTriangle className="w-4 h-4" /> No available slots in this zone.
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-1.5">
                      {availableSlots.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSlotId(s.id)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${
                            slotId === s.id
                              ? 'bg-blue-600 text-white ring-2 ring-blue-400/30'
                              : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/30'
                          }`}
                        >
                          {s.id}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.slot && <p className="mt-1 text-xs text-red-500">{errors.slot}</p>}
                </div>
              </div>

              {/* Vehicle details */}
              <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Vehicle Details</p>

                {/* Entry type toggle */}
                <div className="flex gap-1 bg-muted rounded-xl p-1 border border-border">
                  {([
                    { key: 'walkin' as const, label: 'Walk-in', Icon: Car },
                    { key: 'member' as const, label: 'Member', Icon: Users },
                    { key: 'staff' as const, label: 'Staff', Icon: Shield },
                  ]).map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      onClick={() => { setEntryType(key); setSelectedPerson(null); setSearchPerson(''); setOwner(''); setPhone(''); setErrors({}); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        entryType === key ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Plate Number <span className="text-red-500">*</span></label>
                    <input
                      value={plate} onChange={e => setPlate(e.target.value.toUpperCase())}
                      placeholder="e.g. ABC-1234"
                      className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm font-mono transition-colors placeholder:text-muted-foreground ${errors.plate ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
                    />
                    {errors.plate && <p className="mt-1 text-xs text-red-500">{errors.plate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Vehicle Type</label>
                    <select
                      value={vType} onChange={e => setVType(e.target.value)}
                      className="w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm appearance-none"
                    >
                      {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Walk-in: manual fields */}
                {entryType === 'walkin' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Owner Name <span className="text-red-500">*</span></label>
                      <input
                        value={owner} onChange={e => setOwner(e.target.value)}
                        placeholder="e.g. Sarah Fernando"
                        className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${errors.owner ? 'border-red-500' : 'border-border focus:border-blue-500'}`}
                      />
                      {errors.owner && <p className="mt-1 text-xs text-red-500">{errors.owner}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Phone</label>
                      <input
                        value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+94 77 000 0000"
                        className="w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                )}

                {/* Member/Staff: person search */}
                {entryType !== 'walkin' && (
                  <>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border ${entryType === 'member' ? 'bg-violet-500/5' : 'bg-blue-500/5'}`}>
                      {entryType === 'member'
                        ? <Users className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        : <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      <input
                        value={searchPerson}
                        onChange={e => { setSearchPerson(e.target.value); setSelectedPerson(null); }}
                        placeholder={`Search ${entryType === 'member' ? 'members' : 'staff'}…`}
                        className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                      />
                    </div>
                    {filteredPersons.length === 0 && searchPerson ? (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No {entryType === 'member' ? 'members' : 'staff'} found.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {filteredPersons.map(person => {
                          const ini = person.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                          const selected = selectedPerson?.id === person.id;
                          return (
                            <button
                              key={person.id}
                              onClick={() => onPersonSelect(person)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                selected
                                  ? entryType === 'member'
                                    ? 'bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/20'
                                    : 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${entryType === 'member' ? 'bg-violet-600' : 'bg-blue-600'}`}>
                                {ini}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{person.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{person.email}{person.role ? ` · ${person.role}` : ''}{person.plan ? ` · ${person.plan}` : ''}</p>
                              </div>
                              {selected && <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${entryType === 'member' ? 'text-violet-500' : 'text-blue-500'}`} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {errors.person && <p className="text-xs text-red-500">{errors.person}</p>}
                  </>
                )}

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Notes</label>
                  <textarea
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any additional notes…"
                    rows={2}
                    className="w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border border-border focus:border-blue-500 transition-colors text-sm placeholder:text-muted-foreground resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors text-muted-foreground">Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={availableSlots.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  <Car className="w-4 h-4" /> Park Vehicle
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Parking Checkout Modal ────────────────────────────────────────────────

interface CheckoutSlot {
  slotId: string;
  zoneName: string;
  plate: string;
  vehicleType: string;
  ownerName: string;
  phone?: string;
  entryTime: Date;
  ratePerHour: number;
  currencySymbol: string;
}

function fmtCardNum(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function fmtExp(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function ParkingCheckoutModal({ slot, onClose, onConfirm }: {
  slot: CheckoutSlot;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const durationMins = Math.max(1, Math.floor((Date.now() - slot.entryTime.getTime()) / 60000));
  const hours        = Math.ceil(durationMins / 60);
  const amount       = parseFloat((Math.max(1, hours) * slot.ratePerHour).toFixed(2));
  const hrs  = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  const durationLabel = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const [method, setMethod]         = useState<'card' | 'cash'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess]       = useState(false);

  // card
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry]   = useState('');
  const [cvv, setCvv]         = useState('');
  const [holder, setHolder]   = useState('');
  const [cardErr, setCardErr] = useState<Record<string, string>>({});

  // cash
  const [tendered, setTendered] = useState('');
  const tenderedNum = parseFloat(tendered) || 0;
  const change      = Math.max(0, tenderedNum - amount);
  const cashOk      = tenderedNum >= amount;

  const detectCard = (n: string) => {
    const r = n.replace(/\s/g, '');
    if (/^4/.test(r))      return 'VISA';
    if (/^5[1-5]/.test(r)) return 'Mastercard';
    if (/^3[47]/.test(r))  return 'Amex';
    return null;
  };

  const validateCard = () => {
    const e: Record<string, string> = {};
    if (!holder.trim())                         e.holder = 'Name on card is required.';
    if (cardNum.replace(/\s/g, '').length < 13) e.number = 'Enter a valid card number.';
    if (!/^\d{2}\/\d{2}$/.test(expiry))         e.expiry = 'Use MM/YY format.';
    if (cvv.length < 3)                         e.cvv    = 'Enter a valid CVV.';
    setCardErr(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (method === 'card' && !validateCard()) return;
    if (method === 'cash' && !cashOk) return;
    setProcessing(true);
    try {
      await parkingService.checkoutSlot(slot.slotId, method, slot.ratePerHour);
      setSuccess(true);
      setTimeout(() => { onConfirm(); onClose(); }, 800);
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
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold">Checkout — Slot {slot.slotId}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{slot.plate} · {slot.zoneName}</p>
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
                <p className="text-sm text-muted-foreground mt-1">
                  {slot.currencySymbol}{amount.toFixed(2)} collected via {method === 'card' ? 'Card' : 'Cash'}. Slot {slot.slotId} is now free.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Parking summary */}
              <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Parking Summary</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground mb-0.5">Plate</p><p className="font-mono font-semibold">{slot.plate}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Vehicle</p><p>{slot.vehicleType}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Slot / Zone</p><p>{slot.slotId} · {slot.zoneName}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Owner</p><p>{slot.ownerName}</p></div>
                  <div><p className="text-xs text-muted-foreground mb-0.5">Duration</p><p>{durationLabel}</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Total Due</p>
                    <p className="font-bold text-base">{slot.currencySymbol}{amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'card' as const, label: 'Pay by Card', Icon: Wrench /* placeholder — replaced below */ },
                    { key: 'cash' as const, label: 'Pay by Cash', Icon: Wrench },
                  ]).map(({ key, label }) => {
                    const Icon = key === 'card' ? Car : FileText; // reusing available icons
                    const color = key === 'card' ? 'blue' : 'emerald';
                    return (
                      <button key={key} onClick={() => setMethod(key)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                          method === key ? `bg-${color}-500/10 border-${color}-500/30 ring-1 ring-${color}-500/20` : 'border-border hover:border-blue-500/30 bg-background'
                        }`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${method === key ? `bg-${color}-500/10` : 'bg-muted'}`}>
                          <Icon className={`w-5 h-5 ${method === key ? `text-${color}-500` : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`font-medium text-sm ${method === key ? `text-${color}-500` : 'text-foreground'}`}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card form */}
              {method === 'card' && (
                <div className="bg-background border border-border rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-white/80" />
                      <span className="text-white/80 text-sm font-medium">Card Details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {cardType && <span className="text-white font-bold text-sm tracking-widest">{cardType}</span>}
                      <LogOut className="w-4 h-4 text-white/60" />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Card Number</label>
                      <input value={cardNum} onChange={e => setCardNum(fmtCardNum(e.target.value))}
                        placeholder="0000 0000 0000 0000" maxLength={19}
                        className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${cardErr.number ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                      {cardErr.number && <p className="mt-1 text-xs text-red-500">{cardErr.number}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Cardholder Name</label>
                      <input value={holder} onChange={e => setHolder(e.target.value.toUpperCase())} placeholder="NAME ON CARD"
                        className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm uppercase tracking-wide placeholder:normal-case placeholder:text-muted-foreground transition-colors ${cardErr.holder ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                      {cardErr.holder && <p className="mt-1 text-xs text-red-500">{cardErr.holder}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1.5">Expiry Date</label>
                        <input value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5}
                          className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${cardErr.expiry ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                        {cardErr.expiry && <p className="mt-1 text-xs text-red-500">{cardErr.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1.5">CVV</label>
                        <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" type="password" maxLength={4}
                          className={`w-full bg-card text-foreground rounded-xl px-4 py-2.5 outline-none border font-mono text-sm tracking-widest placeholder:text-muted-foreground transition-colors ${cardErr.cvv ? 'border-red-500' : 'border-border focus:border-blue-500'}`} />
                        {cardErr.cvv && <p className="mt-1 text-xs text-red-500">{cardErr.cvv}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash form */}
              {method === 'cash' && (
                <div className="bg-background border border-border rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Cash Payment</p>
                      <p className="text-xs text-muted-foreground">Enter the amount tendered by the customer.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Amount Due</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl border border-border">
                      <span className="text-sm font-medium text-muted-foreground">{slot.currencySymbol}</span>
                      <span className="text-lg font-bold">{amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Amount Tendered <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">{slot.currencySymbol}</span>
                      <input type="number" step="0.01" min={amount} value={tendered} onChange={e => setTendered(e.target.value)}
                        placeholder={amount.toFixed(2)}
                        className={`w-full bg-card text-foreground rounded-xl pl-9 pr-4 py-2.5 outline-none border text-sm transition-colors placeholder:text-muted-foreground ${!cashOk && tendered ? 'border-red-500' : 'border-border focus:border-emerald-500'}`} />
                    </div>
                    {!cashOk && tendered && <p className="mt-1 text-xs text-red-500">Amount must be at least {slot.currencySymbol}{amount.toFixed(2)}.</p>}
                  </div>
                  {cashOk && tendered && (
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${change > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                      <span className="text-sm text-muted-foreground">Change to return</span>
                      <span className={`text-lg font-bold ${change > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{slot.currencySymbol}{change.toFixed(2)}</span>
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
              disabled={processing || (method === 'cash' && !cashOk && !!tendered)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-all btn-glow ${
                processing ? 'bg-blue-600/70 cursor-not-allowed' :
                method === 'cash' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {processing
                ? <><AlertTriangle className="w-4 h-4 animate-spin" />Processing…</>
                : <><CheckCircle2 className="w-4 h-4" />Confirm Payment · {slot.currencySymbol}{amount.toFixed(2)}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Slots Map ─────────────────────────────────────────────────────────────
function SlotsMap({ 
  zones, 
  currencySymbol, 
  members, 
  staff,
  zoneSlots,
  setZoneSlots,
  loadingSlots,
  userAccess,
  profileName,
  memberEmail,
}: { 
  zones: Zone[]; 
  currencySymbol: string; 
  members: PersonOption[]; 
  staff: PersonOption[];
  zoneSlots: SlotEntry[][];
  setZoneSlots: React.Dispatch<React.SetStateAction<SlotEntry[][]>>;
  loadingSlots: boolean;
  userAccess?: string;
  profileName?: string;
  memberEmail?: string;
}) {
  const [activeZoneIdx, setActiveZoneIdx] = useState(0);
  const [search, setSearch]               = useState('');
  const [dialogSlot, setDialogSlot]       = useState<SlotEntry | null>(null);
  const [showNewEntry, setShowNewEntry]   = useState(false);
  const [checkoutData, setCheckoutData]  = useState<CheckoutSlot | null>(null);

  // Check-in dialog state
  const [checkInSlot, setCheckInSlot]     = useState<SlotEntry | null>(null);
  const [checkInPerson, setCheckInPerson] = useState<PersonOption | null>(null);

  const isMember = userAccess === 'member';

  const updateSlot = (zIdx: number, slotId: string, patch: Partial<SlotEntry>) => {
    setZoneSlots(prev => {
      const next = prev.map(z => [...z]);
      next[zIdx] = next[zIdx].map(s => s.id === slotId ? { ...s, ...patch } : s);
      return next;
    });
  };

  const totalSlots    = zones.reduce((a, z) => a + z.totalSlots, 0);
  const allSlots      = zoneSlots.flat();
  const occupiedCount = allSlots.filter(s => s.status === 'occupied').length;
  const availableCount = allSlots.filter(s => s.status === 'available').length;
  const occupancyPct  = totalSlots > 0 ? Math.round((occupiedCount / totalSlots) * 100) : 0;

  const currentZone  = zones[activeZoneIdx];
  const currentSlots = zoneSlots[activeZoneIdx] ?? [];
  const filteredSlots = search
    ? currentSlots.filter(s => s.id.toLowerCase().includes(search.toLowerCase()) || s.plate?.toLowerCase().includes(search.toLowerCase()))
    : currentSlots;
  // Members see all slots but non-available ones shown in red with no details
  const displaySlots = isMember
    ? filteredSlots.map(s => s.status === 'available' ? s : { ...s, status: 'occupied' as SlotStatus })
    : filteredSlots;

  const handlePark = async (zIdx: number, slotId: string, data: Partial<SlotEntry>) => {
    const zone = zones[zIdx];
    // Call backend
    try {
      await parkingService.toggleSlot(slotId, { 
        vehicle: data.plate,
        vehicleType: data.vehicleType,
        ownerName: data.ownerName,
        phone: data.phone,
        notes: data.notes,
        entryTime: new Date().toISOString(),
      });
      // Update local state on success
      updateSlot(zIdx, slotId, { ...data, status: 'occupied', entryTime: new Date() });
      toast.success(`Vehicle parked in slot ${slotId}`, { description: `${data.plate} · ${data.ownerName}` });
    } catch (e: any) {
      toast.error(e.message || 'Failed to park vehicle');
    }
  };

  const handleParkFromDialog = async (data: Partial<SlotEntry>) => {
    if (!dialogSlot) return;
    const zone = zones[activeZoneIdx];
    try {
      await parkingService.toggleSlot(dialogSlot.id, {
        vehicle: data.plate,
        vehicleType: data.vehicleType,
        ownerName: data.ownerName,
        phone: data.phone,
        notes: data.notes,
        entryTime: new Date().toISOString(),
      });
      updateSlot(activeZoneIdx, dialogSlot.id, { ...data, status: 'occupied', entryTime: new Date() });
      toast.success(`Vehicle parked in slot ${dialogSlot.id}`, { description: `${data.plate} · ${data.ownerName}` });
      setDialogSlot(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to park vehicle');
    }
  };

  const handleRelease = () => {
    if (!dialogSlot) return;
    const zone = zones[activeZoneIdx];
    // Reserved or member/staff entry: release directly without checkout
    if (dialogSlot.reservedForType || dialogSlot.entryType === 'member' || dialogSlot.entryType === 'staff') {
      doRelease(dialogSlot.id);
      setDialogSlot(null);
      return;
    }
    // Walk-in: open checkout before releasing
    setCheckoutData({
      slotId: dialogSlot.id,
      zoneName: zone?.name?.split('—')[0]?.trim() ?? zone?.name ?? '',
      plate: dialogSlot.plate ?? '—',
      vehicleType: dialogSlot.vehicleType ?? 'Vehicle',
      ownerName: dialogSlot.ownerName ?? '—',
      phone: dialogSlot.phone,
      entryTime: dialogSlot.entryTime ?? new Date(),
      ratePerHour: parseFloat(zone?.ratePerHour ?? '10') || 10,
      currencySymbol,
    });
    setDialogSlot(null);
  };

  // Find a non-completed reservation ID for a slot (fallback when reservationId is lost after page reload)
  const findReservationIdBySlot = async (slotId: string): Promise<string | undefined> => {
    try {
      const reservations = await reservationService.fetchReservations();
      const active = reservations?.find(
        r => r.slotId === slotId && (r.status === 'RESERVED' || r.status === 'ACTIVE')
      );
      return active?.id;
    } catch {
      return undefined;
    }
  };

  const doRelease = async (slotId: string, viaCheckout = false) => {
    try {
      await parkingService.toggleSlot(slotId, {});
      // Complete reservation if slot has one — use stored ID or look up by slot
      const slot = zoneSlots[activeZoneIdx]?.find(s => s.id === slotId);
      const reservationId = slot?.reservationId || await findReservationIdBySlot(slotId);
      if (reservationId) {
        await reservationService.completeReservation(reservationId);
      }
      updateSlot(activeZoneIdx, slotId, { status: 'available', plate: undefined, vehicleType: undefined, ownerName: undefined, phone: undefined, notes: undefined, entryTime: undefined, reservationId: undefined });
      toast.success(`Slot ${slotId} released`, { description: viaCheckout ? 'Payment collected. Slot is now available.' : 'Slot is now available.' });
      setCheckoutData(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to release slot');
    }
  };

  const handleSetMaintenance = async (notes: string) => {
    if (!dialogSlot) return;
    try {
      await parkingService.setMaintenance(dialogSlot.id, notes);
      updateSlot(activeZoneIdx, dialogSlot.id, { status: 'maintenance', notes, plate: undefined, entryTime: undefined, reservedFor: undefined, reservedForType: undefined, reservationId: undefined });
      toast.warning(`Slot ${dialogSlot.id} marked as maintenance`, { description: notes || 'Slot is under maintenance.' });
      setDialogSlot(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to set maintenance');
    }
  };

  const handleClearMaintenance = async () => {
    if (!dialogSlot) return;
    try {
      await parkingService.clearMaintenance(dialogSlot.id);
      updateSlot(activeZoneIdx, dialogSlot.id, { status: 'available', notes: undefined });
      toast.success(`Slot ${dialogSlot.id} cleared`, { description: 'Slot is now available.' });
      setDialogSlot(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to clear maintenance');
    }
  };

  const handleReserve = async (data: Partial<SlotEntry>) => {
    if (!dialogSlot) return;
    try {
      // Mark slot as reserved in parking_slots table
      await parkingService.reserveSlot(dialogSlot.id);
      // Create reservation record
      const reservation = await reservationService.createReservation({
        slotId: dialogSlot.id,
        reservedFor: data.reservedFor || '',
        reservedForType: data.reservedForType || 'member',
        reservedForEmail: data.reservedForEmail || '',
        vehicleType: data.vehicleType,
      });
      updateSlot(activeZoneIdx, dialogSlot.id, { ...data, status: 'reserved', reservationId: reservation.id });
      toast.success(`Slot ${dialogSlot.id} reserved`, { description: `Reserved for ${data.reservedFor} (${data.reservedForType})` });
      setDialogSlot(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to reserve slot');
    }
  };

  const handleOpenCheckIn = (slot: SlotEntry) => {
    const person = (slot.reservedForType === 'staff' ? staff : members)
      .find(p => p.name === slot.reservedFor);
    setCheckInPerson(person || null);
    setCheckInSlot(slot);
  };

  const handleCheckIn = async (plate: string, vehicleType: string) => {
    if (!checkInSlot || !checkInPerson) return;
    try {
      await parkingService.toggleSlot(checkInSlot.id, { 
        vehicle: plate, 
        vehicleType,
        ownerName: checkInPerson.name,
        entryTime: new Date().toISOString() 
      });
      // Find reservation ID for check-in — use stored ID or look up by slot
      const reservationId = checkInSlot.reservationId || await findReservationIdBySlot(checkInSlot.id);
      if (reservationId) {
        await reservationService.checkinReservation(reservationId, {
          plate,
          vehicleType,
          ownerName: checkInPerson.name,
        });
      }
      updateSlot(activeZoneIdx, checkInSlot.id, {
        status: 'occupied',
        plate,
        vehicleType,
        ownerName: checkInPerson.name,
        phone: checkInPerson.email,
        entryTime: new Date(),
      });
      toast.success(`Vehicle checked in to slot ${checkInSlot.id}`, { description: `${checkInPerson.name} (${checkInSlot.reservedForType})` });
      setCheckInSlot(null);
      setCheckInPerson(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to check in vehicle');
    }
  };

  const handleReleaseReservation = async () => {
    if (!dialogSlot) return;
    try {
      // Release the slot reservation in parking_slots table
      await parkingService.releaseSlotReservation(dialogSlot.id);
      // Find and cancel the reservation — use stored ID or look up by slot
      const reservationId = dialogSlot.reservationId || await findReservationIdBySlot(dialogSlot.id);
      if (reservationId) {
        await reservationService.cancelReservation(reservationId);
      }
      updateSlot(activeZoneIdx, dialogSlot.id, { 
        status: 'available', 
        reservedFor: undefined, 
        reservedForType: undefined, 
        reservedForEmail: undefined,
        notes: undefined,
        reservationId: undefined,
      });
      toast.success(`Reservation for slot ${dialogSlot.id} released`);
      setDialogSlot(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to release reservation');
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-4">

      {/* Top bar */}
      <div className="flex items-center justify-end gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search slot or plate…"
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-36"
          />
        </div>
        {!isMember && (
          <button
            onClick={() => setShowNewEntry(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium btn-glow active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Slots',  value: totalSlots,     color: 'text-foreground'  },
          { label: 'Available',    value: availableCount, color: 'text-emerald-500' },
          { label: 'Occupied',     value: occupiedCount,  color: 'text-red-500'     },
          { label: 'Occupancy',    value: `${occupancyPct}%`, color: 'text-blue-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 hover-lift">
            <p className="text-xs text-muted-foreground mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Zones Overview */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Zones Overview</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {zones.map((zone, idx) => {
            const slots = zoneSlots[idx] ?? [];
            const occ   = slots.filter(s => s.status === 'occupied').length;
            const pct   = zone.totalSlots > 0 ? Math.round((occ / zone.totalSlots) * 100) : 0;
            const free  = slots.filter(s => s.status === 'available').length;
            const col   = colorOf(zone.color);
            return (
              <button
                key={zone.id}
                onClick={() => setActiveZoneIdx(idx)}
                className={`text-left bg-background border rounded-xl p-4 transition-all ${activeZoneIdx === idx ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-border hover:border-blue-500/40'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${col.text}`} />
                    <span className="text-sm font-medium">{zone.name.split('—')[0].trim()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mb-3">
                  <div className={`h-full rounded-full ${col.bar} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-500">{free} free</span>
                  <span className="text-red-500">{occ} occupied</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot Map */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
        {/* Legend */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Slot Map</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />{isMember ? 'Taken' : 'Occupied'}</span>
            {!isMember && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />Reserved</span>}
            {!isMember && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" />Maintenance</span>}
          </div>
        </div>

        {/* Zone nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${colorOf(currentZone?.color ?? 'blue').text}`} />
            <span className="font-medium">{currentZone?.name?.split('—')[0]?.trim()}</span>
            <span className="text-xs text-muted-foreground">· {currentZone?.totalSlots} slots</span>
          </div>
          <div className="flex items-center gap-2">
            {zones.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveZoneIdx(i)}
                className={`h-2 rounded-full transition-all ${i === activeZoneIdx ? 'bg-blue-500 w-4' : 'bg-muted-foreground/40 w-2 hover:bg-muted-foreground/70'}`}
              />
            ))}
            <button onClick={() => setActiveZoneIdx(i => Math.max(0, i - 1))} disabled={activeZoneIdx === 0}
              className="ml-1 w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-sidebar-accent disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveZoneIdx(i => Math.min(zones.length - 1, i + 1))} disabled={activeZoneIdx === zones.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-sidebar-accent disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slot grid */}
        <div className="grid grid-cols-6 gap-2.5">
          {displaySlots.map(slot => {
            const isTaken = isMember && slot.status === 'occupied';
            return (
              <button
                key={slot.id}
                onClick={() => !isTaken && setDialogSlot(slot)}
                title={slot.status === 'occupied' ? (isMember ? 'Taken' : 'Your parked vehicle') : 'Available'}
                className={`aspect-[5/3] rounded-xl text-sm font-bold text-white shadow-sm relative slot-btn ${slotBg(slot.status)} ${isTaken ? 'cursor-default' : ''}`}
              >
                {isTaken ? (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm font-bold">{slot.id}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-70">Taken</span>
                  </span>
                ) : (
                  slot.id
                )}
                {!isTaken && slot.status === 'occupied' && (
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white/60 rounded-full" />
                )}
              </button>
            );
          })}
          {displaySlots.length === 0 && (
            <div className="col-span-6 py-8 text-center text-muted-foreground text-sm">
              {isMember ? 'No available slots in this zone.' : 'No slots match your search.'}
            </div>
          )}
        </div>
      </div>

      {/* Slot dialog */}
      {dialogSlot && (
        <SlotDialog
          slot={dialogSlot}
          zone={currentZone}
          onClose={() => setDialogSlot(null)}
          onPark={handleParkFromDialog}
          onRelease={handleRelease}
          onSetMaintenance={handleSetMaintenance}
          onClearMaintenance={handleClearMaintenance}
          onReserve={handleReserve}
          onOpenCheckIn={handleOpenCheckIn}
          onReleaseReservation={handleReleaseReservation}
          members={members}
          staff={staff}
          isMember={isMember}
          profileName={profileName}
          memberEmail={memberEmail}
        />
      )}

      {/* Check-in dialog */}
      {checkInSlot && checkInPerson && (
        <CheckInDialog
          slot={checkInSlot}
          person={checkInPerson}
          onCheckIn={handleCheckIn}
          onClose={() => { setCheckInSlot(null); setCheckInPerson(null); }}
        />
      )}

      {/* New Entry modal */}
      {showNewEntry && (
        <NewEntryModal
          zones={zones}
          allZoneSlots={zoneSlots}
          onClose={() => setShowNewEntry(false)}
          onPark={(zIdx, slotId, data) => handlePark(zIdx, slotId, data)}
          members={members ?? []}
          staff={staff ?? []}
        />
      )}

      {checkoutData && (
        <ParkingCheckoutModal
          slot={checkoutData}
          onClose={() => setCheckoutData(null)}
          onConfirm={() => doRelease(checkoutData.slotId, true)}
        />
      )}
    </div>
  );
}

// ─── Slots Analytics ───────────────────────────────────────────────────────

function SlotsAnalytics({ zones, currencySymbol, zoneSlots }: { zones: Zone[]; currencySymbol: string; zoneSlots: SlotEntry[][] }) {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Fetch sessions from backend
  useEffect(() => {
    const loadSessions = async () => {
      setLoadingSessions(true);
      try {
        const data = await parkingService.fetchSessions();
        if (data) setSessions(data);
      } catch (e) {
        console.warn('Failed to load sessions', e);
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, []);

  // Calculate peak hours based on actual entry times of currently occupied slots
  const calculatePeakHours = (): { hour: string; pct: number }[] => {
    const now = new Date();
    const hourBuckets: Record<number, number> = {};
    
    // Initialize all hours 0-23
    for (let h = 0; h < 24; h++) hourBuckets[h] = 0;

    // Count currently occupied slots by their entry hour
    const allOccupied = zoneSlots.flat().filter(s => s.status === 'occupied' && s.entryTime);
    const totalSlots = zones.reduce((a, z) => a + z.totalSlots, 0);

    allOccupied.forEach(slot => {
      const entryHour = new Date(slot.entryTime!).getHours();
      hourBuckets[entryHour] = (hourBuckets[entryHour] || 0) + 1;
    });

    // Convert to percentage of total slots
    return Object.entries(hourBuckets)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([hour, count]) => {
        const h = parseInt(hour);
        let label: string;
        if (h === 0) label = '12 AM';
        else if (h < 12) label = `${h} AM`;
        else if (h === 12) label = '12 PM';
        else label = `${h - 12} PM`;
        return {
          hour: label,
          pct: totalSlots > 0 ? Math.round((count / totalSlots) * 100) : 0,
        };
      });
  };

  const peakHours = calculatePeakHours();

  // Calculate zone utilization
  const zoneUtilization = zones.map((zone, idx) => {
    const slots = zoneSlots[idx];
    const occ = slots.filter(s => s.status === 'occupied').length;
    const pct = zone.totalSlots > 0 ? Math.round((occ / zone.totalSlots) * 100) : 0;
    const col = colorOf(zone.color);
    return { zone, occ, pct, col };
  });

  // Calculate average stay duration from completed sessions
  const avgStayMinutes = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => {
        const entry = new Date(s.entryTime).getTime();
        const exit = new Date().getTime(); // approximate - we don't have exit time in session
        return sum + (exit - entry) / 60000;
      }, 0) / sessions.length)
    : 0;

  const avgStayStr = avgStayMinutes >= 60 
    ? `${Math.floor(avgStayMinutes / 60)}h ${avgStayMinutes % 60}m`
    : `${avgStayMinutes}m`;

  // Calculate turnover rate (sessions per slot per day)
  const totalSlots = zones.reduce((a, z) => a + z.totalSlots, 0);
  const turnoverRate = totalSlots > 0 && sessions.length > 0 
    ? (sessions.length / totalSlots).toFixed(1) 
    : '0';

  // Peak occupancy (max concurrent occupancy today)
  const peakOccupancy = Math.max(...peakHours.map(h => h.pct), 0);

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold">Zone Utilization</h2>
        </div>
        <div className="space-y-4">
          {zones.map((zone, idx) => {
            const slots = zoneSlots[idx];
            const occ = slots.filter(s => s.status === 'occupied').length;
            const pct = zone.totalSlots > 0 ? Math.round((occ / zone.totalSlots) * 100) : 0;
            const col = colorOf(zone.color);
            return (
              <div key={zone.id} className="flex items-center gap-4">
                <span className="w-24 text-sm text-muted-foreground truncate">{zone.name.split('—')[0].trim()}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${col.bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-sm font-medium">{pct}%</span>
                <span className="w-16 text-right text-xs text-muted-foreground">{occ}/{zone.totalSlots}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold">Peak Hours Today</h2>
        </div>
        <div className="flex items-end gap-2 h-32">
          {peakHours.map(({ hour, pct }) => (
            <div key={hour} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end" style={{ height: '96px' }}>
                <div className={`w-full rounded-t-md ${pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ height: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{hour}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Avg. Stay Duration', value: avgStayStr, sub: 'across all zones',  Icon: Clock,      color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
          { label: 'Turnover Rate',      value: `${turnoverRate}x`, sub: 'per slot per day',  Icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Peak Occupancy',     value: `${peakOccupancy}%`, sub: 'today',     Icon: BarChart2,  color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
        ].map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vehicles Sub-view ─────────────────────────────────────────────────────

function VehiclesViewVehicles({ zones, zoneSlots }: { zones: Zone[]; zoneSlots: SlotEntry[][] }) {
  const [search, setSearch] = useState('');
  const allOccupied = zoneSlots.flat().filter(s => s.status === 'occupied' && s.plate);
  // Deduplicate by slot ID to avoid React key conflicts
  const uniqueOccupied = allOccupied.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);

  const filtered = search
    ? uniqueOccupied.filter(s =>
        s.plate?.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.vehicleType?.toLowerCase().includes(search.toLowerCase())
      )
    : allOccupied;

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plate or slot…"
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-40" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Plate Number</span><span>Slot</span><span>Zone</span><span>Vehicle Type</span><span>Duration</span>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              <Car className="w-8 h-8 mx-auto mb-3 opacity-30" />No vehicles currently parked.
            </div>
          ) : filtered.map(slot => {
            const zoneIdx = zones.findIndex(z => slot.id.startsWith(z.prefix));
            const zone = zones[zoneIdx];
            const col = colorOf(zone?.color ?? 'blue');
            return (
              <div key={slot.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${col.light} rounded-lg flex items-center justify-center`}>
                    <Car className={`w-4 h-4 ${col.text}`} />
                  </div>
                  <span className="font-mono font-semibold">{slot.plate}</span>
                </div>
                <span className="text-sm font-medium">{slot.id}</span>
                <span className="text-sm text-muted-foreground">{zone?.name?.split('—')[0]?.trim() ?? '—'}</span>
                <span className="text-sm">{slot.vehicleType}</span>
                <span className="text-sm text-muted-foreground">{slot.entryTime ? timeSince(slot.entryTime) : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-right">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} shown</div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────

export function ParkingSlotsView({ zones, currencySymbol, subView, members, staff, userAccess, profileName, memberEmail }: {
  zones: Zone[];
  currencySymbol: string;
  subView: 'map' | 'analytics' | 'vehicles';
  members: PersonOption[];
  staff: PersonOption[];
  userAccess?: string;
  profileName?: string;
  memberEmail?: string;
}) {
  // Shared zoneSlots state for both SlotsMap and VehiclesView
  const [zoneSlots, setZoneSlots] = useState<SlotEntry[][]>(() => zones.map(z => initSlots(z)));
  const [loadingSlots, setLoadingSlots] = useState(true);
  const isMember = userAccess === 'member';

  // Load slots from backend on mount and when zones change
  useEffect(() => {
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const slots = await parkingService.fetchSlots();
        if (slots) {
          const slotsMap: Record<string, BackendParkingSlot> = {};
          slots.forEach(s => { slotsMap[s.id] = s; });
          
          // Update zoneSlots with backend data
          setZoneSlots(prev => prev.map((zoneSlots, zIdx) => {
            return zoneSlots.map(slot => {
              const backendSlot = slotsMap[slot.id];
              if (backendSlot) {
                const status = backendSlot.occupied ? 'occupied' : backendSlot.reserved ? 'reserved' : backendSlot.maintenance ? 'maintenance' : 'available';
                const isNonAvailable = status !== 'available';
                return {
                  ...slot,
                  status,
                  plate: (isMember && isNonAvailable) ? '' : (backendSlot.vehicle || ''),
                  vehicleType: (isMember && isNonAvailable) ? '' : (backendSlot.vehicleType || ''),
                  ownerName: (isMember && isNonAvailable) ? '' : (backendSlot.ownerName || ''),
                  phone: (isMember && isNonAvailable) ? '' : (backendSlot.phone || ''),
                  notes: (isMember && isNonAvailable) ? '' : (backendSlot.maintenance ? (backendSlot.maintenanceNotes || '') : (backendSlot.notes || '')),
                  entryTime: (isMember && isNonAvailable) ? undefined : (backendSlot.entryTime ? new Date(backendSlot.entryTime) : undefined),
                };
              }
              return slot;
            });
          }));
        }
      } catch (e) {
        console.warn('Failed to load slots from backend, using local state', e);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [zones]);

if (subView === 'analytics') return <SlotsAnalytics zones={zones} currencySymbol={currencySymbol} zoneSlots={zoneSlots} />;
  if (subView === 'vehicles') return <VehiclesViewVehicles zones={zones} zoneSlots={zoneSlots} />;
  return <SlotsMap 
    zones={zones} 
    currencySymbol={currencySymbol} 
    members={members} 
    staff={staff}
    zoneSlots={zoneSlots}
    setZoneSlots={setZoneSlots}
    loadingSlots={loadingSlots}
    userAccess={userAccess}
    profileName={profileName}
    memberEmail={memberEmail}
  />;
}

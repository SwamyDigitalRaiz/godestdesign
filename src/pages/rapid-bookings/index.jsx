import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toaster';
import bookingService from '../../services/bookingService';
import getAdminSocket from '../../services/socketService';
import {
  Bike,
  Search,
  Filter,
  Eye,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign,
  Navigation,
  Car,
  Phone,
  Radio,
  BatteryCharging,
  Layers,
  Crosshair,
  ArrowRight,
  RotateCw,
  ShieldCheck,
  UserCheck,
  Users,
  AlertCircle,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';

const mockRapidRides = [
  {
    id: 'RPD-9081',
    mongoId: 'mock-1',
    user: { name: 'Aarav Sharma', phone: '+91 98112 33445' },
    driver: { name: 'Rajesh Kumar', phone: '+91 98765 43210', vehicleNo: 'AP 09 TG 1234', rating: '4.8' },
    vehicleType: 'Auto',
    pickup: 'Hitech City Cyber Towers, Madhapur',
    drop: 'Gachibowli DLF Cybercity',
    pickupCoords: [17.4504, 78.3808],
    dropCoords: [17.4435, 78.3582],
    driverCoords: [17.4470, 78.3710],
    distance: '6.4 km',
    remainingDistance: '2.4 km',
    duration: '18 mins',
    eta: '6 mins',
    speed: '34 km/h',
    battery: '82%',
    fare: '₹145',
    surge: '1.2x',
    paymentMethod: 'UPI',
    otp: '4821',
    status: 'ongoing',
    time: '2 mins ago',
  },
  {
    id: 'RPD-9082',
    mongoId: 'mock-2',
    user: { name: 'Sneha Patel', phone: '+91 98223 44556' },
    driver: { name: 'Suresh Varma', phone: '+91 98451 23456', vehicleNo: 'TS 07 EA 9821', rating: '4.9' },
    vehicleType: 'Bike',
    pickup: 'Kukatpally Metro Station',
    drop: 'JNTU College Road',
    pickupCoords: [17.4852, 78.4095],
    dropCoords: [17.4984, 78.3900],
    driverCoords: [17.4910, 78.4005],
    distance: '3.1 km',
    remainingDistance: '1.2 km',
    duration: '9 mins',
    eta: '4 mins',
    speed: '42 km/h',
    battery: '91%',
    fare: '₹55',
    surge: '1.0x',
    paymentMethod: 'Go Dest Wallet',
    otp: '7729',
    status: 'ongoing',
    time: '5 mins ago',
  },
  {
    id: 'RPD-9083',
    mongoId: 'mock-3',
    user: { name: 'Vikram Rao', phone: '+91 98334 55667' },
    driver: { name: 'Karthik Rao', phone: '+91 95000 11223', vehicleNo: 'TS 09 XY 3321', rating: '4.7' },
    vehicleType: 'Bike',
    pickup: 'Secunderabad Railway Station',
    drop: 'Begumpet Airport Road',
    pickupCoords: [17.4334, 78.5015],
    dropCoords: [17.4450, 78.4680],
    driverCoords: [17.4450, 78.4680],
    distance: '5.2 km',
    remainingDistance: '0.0 km',
    duration: '14 mins',
    eta: 'Delivered',
    speed: '0 km/h',
    battery: '74%',
    fare: '₹85',
    surge: '1.0x',
    paymentMethod: 'Cash',
    otp: '9102',
    status: 'completed',
    time: '22 mins ago',
  },
  {
    id: 'RPD-9084',
    mongoId: 'mock-4',
    user: { name: 'Pooja Nair', phone: '+91 98445 66778' },
    driver: { name: 'Anil Reddy', phone: '+91 96123 78901', vehicleNo: 'AP 16 UB 7812', rating: '5.0' },
    vehicleType: 'Auto',
    pickup: 'Banjara Hills Road No 12',
    drop: 'Jubilee Hills Checkpost',
    pickupCoords: [17.4144, 78.4350],
    dropCoords: [17.4285, 78.4090],
    driverCoords: [17.4285, 78.4090],
    distance: '4.8 km',
    remainingDistance: '0.0 km',
    duration: '15 mins',
    eta: 'Delivered',
    speed: '0 km/h',
    battery: '68%',
    fare: '₹120',
    surge: '1.1x',
    paymentMethod: 'UPI',
    otp: '3341',
    status: 'completed',
    time: '45 mins ago',
  },
  {
    id: 'RPD-9085',
    mongoId: 'mock-5',
    user: { name: 'Rohan Gupta', phone: '+91 98556 77889' },
    driver: null,
    vehicleType: 'Auto',
    pickup: 'Ameerpet Metro Junction',
    drop: 'SR Nagar Main Road',
    pickupCoords: [17.4375, 78.4482],
    dropCoords: [17.4430, 78.4420],
    driverCoords: null,
    distance: '2.0 km',
    remainingDistance: '2.0 km',
    duration: '—',
    eta: 'Cancelled',
    speed: '0 km/h',
    battery: '—',
    fare: '₹60',
    surge: '1.0x',
    paymentMethod: 'Go Dest Wallet',
    otp: '—',
    status: 'cancelled',
    time: '1 hr ago',
  },
];

const BOOKING_STEPS = [
  { key: 'requested', label: 'Requested' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'arrived', label: 'Reached pickup' },
  { key: 'otp_verified', label: 'OTP verified' },
  { key: 'in_progress', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'payment', label: 'Payment' },
];

function formatStepTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function timelineKeys(ride) {
  return (ride.timeline || []).map((item) => item.key);
}

function isTimeExpired(ride) {
  const keys = timelineKeys(ride);
  const reason = `${ride.cancellationReason || ''} ${ride.endReason || ''} ${ride.reason || ''}`.toLowerCase();
  return (
    ride.status === 'search_expired' ||
    keys.includes('search_expired') ||
    ride.endReason === 'search_expired' ||
    ride.reason === 'search_expired' ||
    ride.cancelledBy === 'system' ||
    (ride.status === 'cancelled' &&
      (reason.includes('time expired') ||
        reason.includes('no captains') ||
        reason.includes('search time')))
  );
}

function getRideStepIndex(ride) {
  const keys = timelineKeys(ride);
  if (ride.paymentStatus === 'paid' || keys.includes('payment_paid')) return 6;
  if (ride.status === 'completed' || keys.includes('completed')) return 6;
  if (ride.status === 'in_progress' || keys.includes('in_progress')) return 4;
  if (keys.includes('otp_verified')) return 3;
  if (ride.status === 'arrived' || keys.includes('arrived')) return 2;
  if (ride.status === 'accepted' || keys.includes('accepted')) return 1;
  if (ride.status === 'cancelled' || isTimeExpired(ride)) {
    if (keys.includes('in_progress')) return 4;
    if (keys.includes('otp_verified')) return 3;
    if (keys.includes('arrived')) return 2;
    if (keys.includes('accepted')) return 1;
    return 0;
  }
  return 0;
}

function terminalLabel(ride) {
  if (isTimeExpired(ride)) return 'Time expired';
  if (ride.cancelledBy === 'user') return 'Cancelled by user';
  if (ride.cancelledBy === 'driver') return 'Cancelled by captain';
  if (ride.cancelledBy === 'admin') return 'Cancelled by admin';
  return 'Cancelled';
}

function statusLabel(ride) {
  const status = typeof ride === 'string' ? ride : ride?.status;
  if (typeof ride === 'object' && ride) {
    if (ride.status === 'cancelled' || isTimeExpired(ride)) {
      return terminalLabel(ride);
    }
  }
  switch (status) {
    case 'requested':
      return 'Requested';
    case 'accepted':
      return 'Accepted';
    case 'arrived':
      return 'At pickup';
    case 'in_progress':
    case 'ongoing':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'search_expired':
      return 'Time expired';
    default:
      return status;
  }
}

function BookingLifecycleStepper({ ride }) {
  const activeIndex = getRideStepIndex(ride);
  const timelineByKey = Object.fromEntries(
    (ride.timeline || []).map((item) => [item.key, item])
  );
  const ended = ride.status === 'cancelled' || isTimeExpired(ride);
  const endedAt = formatStepTime(
    timelineByKey.search_expired?.at ||
    timelineByKey.cancelled?.at ||
    ride.cancelledAt
  );

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Trip progress</p>
      <ol className="space-y-2.5">
        {BOOKING_STEPS.map((step, index) => {
          const done =
            !ended &&
            (activeIndex > index || (step.key === 'payment' && ride.paymentStatus === 'paid'));
          const reached = ended
            ? index <= activeIndex
            : done || activeIndex === index;
          const current = !ended && activeIndex === index;
          const skipped = ended && index > activeIndex;
          const time =
            formatStepTime(
              timelineByKey[step.key]?.at ||
              (step.key === 'payment'
                ? timelineByKey.payment_paid?.at || timelineByKey.payment_pending?.at
                : null) ||
              (step.key === 'otp_verified' ? ride.otpVerifiedAt : null) ||
              ride[`${step.key}At`]
            );
          return (
            <li key={step.key} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${reached && !skipped
                    ? 'bg-emerald-500 text-white'
                    : current
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                  }`}
              >
                {reached && !skipped ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${skipped
                      ? 'text-slate-400 line-through'
                      : reached || current
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400'
                    }`}
                >
                  {step.label}
                  {step.key === 'payment' ? ` • ${(ride.paymentStatus || 'pending').replace('_', ' ')}` : ''}
                </p>
                {time ? (
                  <p className="text-[11px] text-slate-500">{time}</p>
                ) : current ? (
                  <p className="text-[11px] text-blue-600">In progress</p>
                ) : skipped ? (
                  <p className="text-[11px] text-slate-400">Not reached</p>
                ) : null}
              </div>
            </li>
          );
        })}
        {ended && (
          <li className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isTimeExpired(ride) ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                }`}
            >
              <XCircle className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold ${isTimeExpired(ride) ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300'
                  }`}
              >
                {terminalLabel(ride)}
              </p>
              {endedAt ? <p className="text-[11px] text-slate-500">{endedAt}</p> : null}
              {ride.cancellationReason ? (
                <p className="text-[11px] text-slate-500">{ride.cancellationReason}</p>
              ) : null}
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MANUAL DRIVER ASSIGNMENT MODAL COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function AssignDriverModal({ ride, onClose, onAssigned }) {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverSearch, setDriverSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getAvailableDrivers({ vehicleType: ride.vehicleType });
        if (mounted && res?.data?.drivers) {
          setDrivers(res.data.drivers);
          if (res.data.drivers.length > 0) {
            setSelectedDriverId(res.data.drivers[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch available drivers', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDrivers();
    return () => {
      mounted = false;
    };
  }, [ride]);

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.phone.includes(driverSearch) ||
      d.vehicleNo.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!selectedDriverId) {
      toast({
        title: 'Select a Driver',
        description: 'Please select a driver from the list to assign.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAssigning(true);
      const targetRideId = ride.mongoId || ride.id;
      const res = await bookingService.assignDriver(targetRideId, selectedDriverId);
      const chosenDriver = drivers.find((d) => d.id === selectedDriverId);
      toast({
        title: 'Driver Assigned Successfully!',
        description: `${chosenDriver?.name || 'Driver'} is now assigned to ride #${ride.id}. Both User & Driver apps updated in real-time.`,
      });
      onAssigned(ride, chosenDriver);
      onClose();
    } catch (err) {
      toast({
        title: 'Assignment Failed',
        description: err.response?.data?.message || err.message || 'Could not assign driver.',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-500/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Manual Driver Assignment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Booking Request <span className="font-mono font-bold text-amber-600 dark:text-amber-400">#{ride.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={assigning}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Ride Request Summary */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">{ride.user?.name || 'Customer'}</span>
              <span className="text-slate-400">({ride.user?.phone || '—'})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {ride.vehicleType}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{ride.fare}</span>
            </div>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{ride.pickup}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span className="truncate">{ride.drop}</span>
            </div>
          </div>
        </div>

        {/* Driver Selection Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-500" />
              Select Available Driver ({filteredDrivers.length})
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search driver by name, phone, vehicle no..."
              value={driverSearch}
              onChange={(e) => setDriverSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <p className="text-xs">Loading available drivers...</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-1">
              <AlertCircle className="h-7 w-7 mx-auto text-amber-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No active drivers found</p>
              <p className="text-[11px]">Make sure drivers are registered and approved in the system.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredDrivers.map((driver) => {
                const isSelected = selectedDriverId === driver.id;
                return (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200 overflow-hidden">
                          {driver.photo ? (
                            <img src={driver.photo} alt={driver.name} className="h-full w-full object-cover" />
                          ) : (
                            driver.name.charAt(0)
                          )}
                        </div>
                        {driver.isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{driver.name}</p>
                          <span className="text-[10px] text-amber-500 font-bold">{driver.rating}</span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">{driver.vehicleNo} • {driver.vehicleType}</p>
                        <p className="text-[10px] text-slate-400">{driver.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {driver.isOnline ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Available
                        </span>
                      )}
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${isSelected
                            ? 'bg-amber-500 border-amber-500 text-slate-950'
                            : 'border-slate-300 dark:border-slate-600'
                          }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={assigning}
            className="cursor-pointer text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={assigning || !selectedDriverId || filteredDrivers.length === 0}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
          >
            {assigning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Assigning Driver...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                <span>Confirm & Assign Driver</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   LIVE RIDE TRACKING MODAL COMPONENT (LEAFLET GPS)
   ────────────────────────────────────────────────────────────────────────── */
function normalizeLatLng(c) {
  if (!Array.isArray(c) || c.length < 2) return null;
  const a = Number(c[0]);
  const b = Number(c[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  // If a looks like longitude in India (60-105) and b looks like latitude (5-40), swap to [lat, lng]
  if (a >= 60 && a <= 105 && b >= 5 && b <= 40) {
    return [b, a];
  }
  return [a, b];
}

function generateCurvedRoadSpline(p1, p2, steps = 24) {
  const points = [];
  const dLat = p2[0] - p1[0];
  const dLng = p2[1] - p1[1];
  const perpLat = -dLng * 0.14;
  const perpLng = dLat * 0.14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const arch = Math.sin(t * Math.PI);
    const wave = Math.sin(t * Math.PI * 3) * 0.25;
    const offset = (arch + wave * 0.2) * 1.0;
    points.push([p1[0] + dLat * t + perpLat * offset, p1[1] + dLng * t + perpLng * offset]);
  }
  return points;
}

function resolveCoordFromAddress(address, fallback) {
  if (!address) return fallback;
  const lower = String(address).toLowerCase();
  if (/airport|shamshabad|rgia|rajiv gandhi|hyd/i.test(lower)) return [17.2403, 78.4294];
  if (/manjeera|jntu|kukatpally/i.test(lower)) return [17.4925, 78.3925];
  if (/uppal/i.test(lower)) return [17.4018, 78.5602];
  if (/cyber towers|hitec/i.test(lower)) return [17.4504, 78.3808];
  if (/inorbit|mindspace/i.test(lower)) return [17.4345, 78.3860];
  if (/stadium|basheerbagh|lbs/i.test(lower)) return [17.3970, 78.4735];
  if (/nexus|forum/i.test(lower)) return [17.4852, 78.3900];
  if (/secunderabad/i.test(lower)) return [17.4334, 78.5015];
  if (/madhapur/i.test(lower)) return [17.4435, 78.3952];
  if (/attapur|gudimalkapur/i.test(lower)) return [17.3687, 78.4385];
  return fallback;
}

function LiveTrackingModal({ ride, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [mapType, setMapType] = useState('streets');
  const [telemetry, setTelemetry] = useState({
    speed: ride.speed || '32 km/h',
    eta: ride.eta || '6 mins',
    remaining: ride.remainingDistance || ride.distance || '2.4 km',
    battery: ride.battery || '84%',
    lastUpdated: 'Just now',
  });

  const pCoords = normalizeLatLng(ride.pickupCoords) || resolveCoordFromAddress(ride.pickup, [17.4925, 78.3925]);
  const dCoords = normalizeLatLng(ride.dropCoords) || resolveCoordFromAddress(ride.drop, [17.2403, 78.4294]);
  const drvCoords = ride.driverCoords ? normalizeLatLng(ride.driverCoords) : null;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = drvCoords || pCoords;
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl =
      mapType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // 1. Pickup Pin Marker
    const pickupIcon = L.divIcon({
      className: 'custom-pickup-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #10b981; color: white; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); white-space: nowrap; border: 2px solid white;">
            🟢 Pickup: ${ride.user?.name || 'Rider'}
          </div>
          <div style="width: 14px; height: 14px; background: #10b981; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-top: 2px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });
    L.marker(pCoords, { icon: pickupIcon }).addTo(map);

    // 2. Dropoff Pin Marker
    const dropIcon = L.divIcon({
      className: 'custom-drop-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #ef4444; color: white; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); white-space: nowrap; border: 2px solid white;">
            🏁 Destination
          </div>
          <div style="width: 14px; height: 14px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-top: 2px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });
    L.marker(dCoords, { icon: dropIcon }).addTo(map);

    // 3. Driver Live Location Pin Marker
    if (drvCoords) {
      const isAuto = ride.vehicleType === 'Auto';
      const vehicleEmoji = isAuto ? '🛺' : '🏍️';
      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
              <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #3b82f6; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="position: relative; width: 34px; height: 34px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(37,99,235,0.5); font-size: 16px;">
                ${vehicleEmoji}
              </div>
            </div>
            <div style="background: #1e293b; color: #f8fafc; font-size: 10px; font-weight: 700; font-family: monospace; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 1px solid #475569; margin-top: -4px;">
              ${ride.driver?.vehicleNo || 'Active Vehicle'}
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker(drvCoords, { icon: driverIcon }).addTo(map);
    }

    // 4. Initial Road Spline (Guaranteed Smooth Curve, never a stiff straight line)
    const initialSpline =
      Array.isArray(ride.routeCoordinates) && ride.routeCoordinates.length > 2
        ? ride.routeCoordinates.map(normalizeLatLng)
        : generateCurvedRoadSpline(pCoords, dCoords, 28);

    const shadowLine = L.polyline(initialSpline, {
      color: '#1e3a8a',
      weight: 8,
      opacity: 0.2,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    const mainLine = L.polyline(initialSpline, {
      color: '#2563eb',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    routeLayerRef.current = { shadow: shadowLine, main: mainLine };

    // Dynamic OSRM Road Geometry Fetch
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${pCoords[1]},${pCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.routes?.[0]?.geometry?.coordinates?.length) {
          const roadPoints = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
          if (routeLayerRef.current?.shadow && routeLayerRef.current?.main) {
            routeLayerRef.current.shadow.setLatLngs(roadPoints);
            routeLayerRef.current.main.setLatLngs(roadPoints);
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(L.latLngBounds(roadPoints), { padding: [50, 50] });
          }
        }
      })
      .catch(() => { });

    const allPoints = [pCoords, dCoords];
    if (drvCoords) allPoints.push(drvCoords);
    map.fitBounds(L.latLngBounds(allPoints), { padding: [60, 60] });

    mapInstanceRef.current = map;

    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [ride, mapType]);

  const handleRecenter = () => {
  if (!mapInstanceRef.current) return;
  const center = ride.driverCoords || ride.pickupCoords;
  mapInstanceRef.current.setView(center, 15, { animate: true });
};

const handleRefresh = () => {
  setTelemetry((prev) => ({
    ...prev,
    lastUpdated: '1 sec ago',
    speed: ride.status === 'ongoing' ? `${Math.floor(28 + Math.random() * 16)} km/h` : '0 km/h',
  }));
};

return (
  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
    <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Live Ride Tracking: <span className="font-mono text-blue-600 dark:text-blue-400">#{ride.id}</span>
              </h3>
              {ride.status === 'ongoing' && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE GPS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ride.vehicleType} Mobility • Booked {ride.time} • OTP:{' '}
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{ride.otp}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Telemetry"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-100 dark:bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Map Controls */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            onClick={handleRecenter}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Recenter on Driver"
          >
            <Crosshair className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={mapType === 'streets' ? 'Switch to Satellite' : 'Switch to Street Map'}
          >
            <Layers className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Floating Driver Status Banner on Map */}
        {ride.driver && ride.status === 'ongoing' && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-slate-950 font-black text-sm flex items-center justify-center border border-primary/40 shrink-0">
                  {ride.driver.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {ride.driver.name}
                    <span className="text-[10px] text-amber-500 font-bold">★ {ride.driver.rating || '4.8'}</span>
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 font-semibold">{ride.driver.vehicleNo}</p>
                </div>
              </div>

              <a
                href={`tel:${ride.driver.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Driver
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry and Trip Summary Footer */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Radio className="h-3 w-3 text-blue-500" />
              Live Speed
            </p>
            <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{telemetry.speed}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Estimated Arrival
            </p>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">{telemetry.eta}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3 text-purple-500" />
              Remaining Dist
            </p>
            <p className="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5">{telemetry.remaining}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Trip Fare & Surge
            </p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {ride.fare} {ride.surge !== '1.0x' && <span className="text-xs text-amber-600">({ride.surge})</span>}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 max-w-xl truncate">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{ride.pickup}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{ride.drop}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
            <span>
              Rider: <strong className="text-slate-700 dark:text-slate-300">{ride.user.name}</strong> (
              {ride.user.phone})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN BIKE & AUTO BOOKINGS PAGE
   ────────────────────────────────────────────────────────────────────────── */
export function RapidBookingsPage() {
  const { toast } = useToast();
  const [rides, setRides] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    requested: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [selectedRide, setSelectedRide] = useState(null);
  const [trackingRide, setTrackingRide] = useState(null);
  const [assignModalRide, setAssignModalRide] = useState(null);

  // Fetch bookings from backend API
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookings({
        status: statusFilter,
        vehicleType: vehicleFilter,
        search,
      });

      if (res?.data && Array.isArray(res.data.rides)) {
        if (res.data.rides.length > 0 || (res.data.counts && res.data.counts.all > 0)) {
          setRides(res.data.rides);
          if (res.data.counts) {
            setCounts(res.data.counts);
          }
        } else {
          // Fallback to mock data only if DB is completely fresh with 0 total rides
          setRides(mockRapidRides);
          setCounts({
            all: mockRapidRides.length,
            requested: mockRapidRides.filter((r) => r.status === 'requested').length,
            ongoing: mockRapidRides.filter((r) => r.status === 'ongoing').length,
            completed: mockRapidRides.filter((r) => r.status === 'completed').length,
            cancelled: mockRapidRides.filter((r) => r.status === 'cancelled').length,
          });
        }
      }
    } catch (err) {
      console.warn('Backend bookings fetch failed, using local active state', err);
      if (rides.length === 0) {
        setRides(mockRapidRides);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, vehicleFilter, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Connect WebSockets for Real-Time Booking Requests & Status Updates
  useEffect(() => {
    const socket = getAdminSocket();

    const handleNewRide = (payload) => {
      toast({
        title: 'New Booking Request Received!',
        description: `Ride #${payload.customId || payload.rideId} from ${payload.passengerName || 'Customer'} (${payload.vehicleType || 'Auto'})`,
      });

      // Format incoming socket ride and prepend to list
      const formatted = {
        id: payload.customId || `RPD-${payload.rideId?.slice(-4) || '9999'}`,
        mongoId: payload.rideId,
        user: {
          name: payload.passengerName || 'Customer',
          phone: payload.passengerPhone || '—',
          image: null,
        },
        driver: null,
        vehicleType: payload.vehicleType || 'Auto',
        pickup: payload.pickupAddress || 'Pickup Location',
        drop: payload.dropAddress || 'Drop Location',
        pickupCoords: payload.pickupCoordinates?.length === 2
          ? [payload.pickupCoordinates[1], payload.pickupCoordinates[0]]
          : [17.4483, 78.3826],
        dropCoords: payload.dropCoordinates?.length === 2
          ? [payload.dropCoordinates[1], payload.dropCoordinates[0]]
          : [17.4483, 78.3826],
        driverCoords: null,
        distance: `${payload.distanceKm || 4.2} km`,
        remainingDistance: `${payload.distanceKm || 4.2} km`,
        duration: '15 mins',
        eta: 'Searching',
        speed: '0 km/h',
        battery: '88%',
        fare: `₹${payload.fare || 95}`,
        rawFare: payload.fare,
        surge: '1.0x',
        paymentMethod: 'Cash',
        paymentStatus: 'pending',
        otp: payload.otp || '—',
        status: 'requested',
        createdAt: payload.createdAt || new Date(),
        time: 'Just now',
      };

      setRides((prev) => [formatted, ...prev.filter((r) => r.mongoId !== payload.rideId)]);
      setCounts((prev) => ({
        ...prev,
        all: prev.all + 1,
        requested: prev.requested + 1,
      }));
    };

    const patchRideFromSocket = (r, payload) => {
      if (r.mongoId !== payload.rideId && r.id !== payload.customId) return r;
      return {
        ...r,
        status: payload.status === 'search_expired' ? 'cancelled' : (payload.status || r.status),
        paymentStatus: payload.paymentStatus || r.paymentStatus,
        paymentMethod: payload.paymentMethod || r.paymentMethod,
        timeline: payload.timeline || r.timeline,
        acceptedAt: payload.acceptedAt || r.acceptedAt,
        arrivedAt: payload.arrivedAt || r.arrivedAt,
        otpVerifiedAt: payload.otpVerifiedAt || r.otpVerifiedAt,
        startedAt: payload.startedAt || r.startedAt,
        completedAt: payload.completedAt || r.completedAt,
        cancelledAt: payload.cancelledAt || r.cancelledAt,
        cancelledBy: payload.cancelledBy || r.cancelledBy,
        cancellationReason: payload.cancellationReason || r.cancellationReason,
        endReason:
          payload.status === 'search_expired' || payload.reason === 'search_expired'
            ? 'search_expired'
            : payload.reason || payload.endReason || r.endReason,
        driver: payload.driverName
          ? {
            ...(r.driver || {}),
            name: payload.driverName,
          }
          : r.driver,
      };
    };

    const handleRideUpdated = (payload) => {
      setRides((prev) => prev.map((r) => patchRideFromSocket(r, payload)));
      setSelectedRide((prev) => (prev ? patchRideFromSocket(prev, payload) : prev));
      setTrackingRide((prev) => (prev ? patchRideFromSocket(prev, payload) : prev));
    };

    socket.on('admin:ride:new', handleNewRide);
    socket.on('admin:ride:updated', handleRideUpdated);
    socket.on('admin:ride:status', handleRideUpdated);
    socket.on('ride:accepted', handleRideUpdated);
    socket.on('ride:status:changed', handleRideUpdated);

    return () => {
      socket.off('admin:ride:new', handleNewRide);
      socket.off('admin:ride:updated', handleRideUpdated);
      socket.off('admin:ride:status', handleRideUpdated);
      socket.off('ride:accepted', handleRideUpdated);
      socket.off('ride:status:changed', handleRideUpdated);
    };
  }, [toast]);

  // Handle local state update after manual assignment
  const handleDriverAssigned = (assignedRide, driver) => {
    setRides((prev) =>
      prev.map((r) => {
        if (r.mongoId === assignedRide.mongoId || r.id === assignedRide.id) {
          return {
            ...r,
            status: 'accepted',
            driver: {
              id: driver.id,
              name: driver.name,
              phone: driver.phone,
              vehicleNo: driver.vehicleNo,
              vehicleType: driver.vehicleType,
              rating: driver.rating,
              image: driver.photo,
            },
          };
        }
        return r;
      })
    );

    setCounts((prev) => ({
      ...prev,
      requested: Math.max(0, prev.requested - 1),
      ongoing: prev.ongoing + 1,
    }));
  };

  const expiredCount = rides.filter(isTimeExpired).length;
  const trueCancelledCount = rides.filter(
    (r) => r.status === 'cancelled' && !isTimeExpired(r)
  ).length;

  const filtered = rides.filter((ride) => {
    const matchSearch =
      ride.id.toLowerCase().includes(search.toLowerCase()) ||
      ride.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      ride.pickup.toLowerCase().includes(search.toLowerCase()) ||
      ride.drop.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'ongoing'
          ? ['accepted', 'arrived', 'in_progress', 'ongoing'].includes(ride.status)
          : statusFilter === 'time_expired'
            ? isTimeExpired(ride)
            : statusFilter === 'cancelled'
              ? ride.status === 'cancelled' && !isTimeExpired(ride)
              : ride.status === statusFilter;

    const matchVehicle =
      vehicleFilter === 'all' || ride.vehicleType.toLowerCase() === vehicleFilter.toLowerCase();

    return matchSearch && matchStatus && matchVehicle;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
              <Zap className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bike & Auto Bookings
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time monitoring of on-demand auto and bike rides, booking requests, manual driver assignment, and live GPS tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const active = rides.find((r) => ['ongoing', 'in_progress', 'accepted'].includes(r.status)) || rides[0];
              if (active) setTrackingRide(active);
            }}
            className="flex items-center gap-1.5 cursor-pointer font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Navigation className="h-4 w-4 text-blue-600 animate-pulse" />
            Live Map View
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending Requests KPI */}
        <Card
          onClick={() => setStatusFilter('requested')}
          className={`cursor-pointer transition-all ${statusFilter === 'requested'
              ? 'ring-2 ring-amber-500 bg-amber-500/10'
              : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:border-amber-400'
            }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                {counts.requested > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
                Booking Requests
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {counts.requested || 0}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Ongoing Rides */}
        <Card
          onClick={() => setStatusFilter('ongoing')}
          className={`cursor-pointer transition-all ${statusFilter === 'ongoing'
              ? 'ring-2 ring-blue-500 bg-blue-500/10'
              : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 hover:border-blue-400'
            }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Ongoing Rides
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {counts.ongoing || 0}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Completed Rides */}
        <Card
          onClick={() => setStatusFilter('completed')}
          className={`cursor-pointer transition-all ${statusFilter === 'completed'
              ? 'ring-2 ring-emerald-500 bg-emerald-500/10'
              : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400'
            }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Completed Rides
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {counts.completed || 0}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Cancelled Rides */}
        <Card
          onClick={() => setStatusFilter('cancelled')}
          className={`cursor-pointer transition-all ${statusFilter === 'cancelled'
              ? 'ring-2 ring-red-500 bg-red-500/10'
              : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 hover:border-red-400'
            }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Cancelled Rides
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {trueCancelledCount}
              </h3>
              {expiredCount > 0 && (
                <p className="text-[10px] font-medium text-amber-600 mt-1">
                  {expiredCount} time expired
                </p>
              )}
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold shadow-sm">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search ride ID, rider name, address..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'requested', label: 'Requests', count: counts.requested },
                  { id: 'ongoing', label: 'Ongoing', count: counts.ongoing },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' },
                  { id: 'time_expired', label: 'Time expired' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer flex items-center gap-1.5 ${statusFilter === tab.id
                        ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${statusFilter === tab.id
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-amber-500 text-slate-950 animate-pulse'
                          }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vehicles (Auto & Bike)</option>
                <option value="auto">Auto Only</option>
                <option value="bike">Bike Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rides Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 font-semibold">Ride ID</th>
                <th className="py-3 px-4 font-semibold">Vehicle</th>
                <th className="py-3 px-4 font-semibold">Rider</th>
                <th className="py-3 px-4 font-semibold">Driver & Vehicle</th>
                <th className="py-3 px-4 font-semibold">Route (Pickup → Drop)</th>
                <th className="py-3 px-4 font-semibold">Fare & Surge</th>
                <th className="py-3 px-4 font-semibold">OTP</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No booking requests found</p>
                    <p className="text-xs text-slate-500 mt-1">Try switching filters or search keywords</p>
                  </td>
                </tr>
              ) : (
                filtered.map((ride) => (
                  <tr key={ride.mongoId || ride.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {ride.id}
                      <p className="text-[11px] font-sans font-normal text-slate-400">{ride.time}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold text-xs border border-amber-200 dark:border-amber-900/50">
                        {ride.vehicleType === 'Auto' ? <Car className="h-3.5 w-3.5" /> : <Bike className="h-3.5 w-3.5" />}
                        {ride.vehicleType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">{ride.user?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500">{ride.user?.phone || '—'}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {ride.driver ? (
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-xs">{ride.driver.name}</p>
                          <p className="text-[11px] font-mono text-slate-500">{ride.driver.vehicleNo}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span>Pending Assignment</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate text-slate-700 dark:text-slate-300">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                          <span className="truncate text-slate-700 dark:text-slate-300">{ride.drop}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{ride.fare}</span>
                        {ride.surge !== '1.0x' && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {ride.surge}
                          </span>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {ride.distance} • {ride.paymentMethod}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                        {ride.otp}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {ride.status === 'requested' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                          <Clock className="h-3 w-3" />
                          Requested
                        </span>
                      ) : isTimeExpired(ride) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Clock className="h-3 w-3" />
                          Time expired
                        </span>
                      ) : (
                        <Badge
                          variant={
                            ['accepted', 'ongoing', 'in_progress', 'arrived'].includes(ride.status)
                              ? 'warning'
                              : ride.status === 'completed'
                                ? 'success'
                                : 'destructive'
                          }
                          className="capitalize"
                        >
                          {statusLabel(ride)}
                        </Badge>
                      )}
                      <div className="mt-1.5 flex items-center gap-1">
                        {BOOKING_STEPS.map((step, i) => {
                          const active = getRideStepIndex(ride);
                          return (
                            <span
                              key={step.key}
                              title={step.label}
                              className={`h-1.5 w-1.5 rounded-full ${i <= active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                            />
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* MANUAL ASSIGN DRIVER BUTTON (For Requested Bookings) */}
                        {ride.status === 'requested' && (
                          <Button
                            size="sm"
                            onClick={() => setAssignModalRide(ride)}
                            className="h-8 px-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                            title="Assign Active Driver"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Assign Driver</span>
                          </Button>
                        )}

                        {/* TRACK BUTTON (For Active/Completed Rides) */}
                        {ride.status !== 'requested' && (
                          <Button
                            size="sm"
                            onClick={() => setTrackingRide(ride)}
                            className={`h-8 px-2.5 text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all ${['accepted', 'arrived', 'ongoing', 'in_progress'].includes(ride.status)
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            title={['accepted', 'arrived', 'ongoing', 'in_progress'].includes(ride.status) ? 'Live GPS Track Ride' : 'View Route Map'}
                          >
                            {['accepted', 'arrived', 'ongoing', 'in_progress'].includes(ride.status) ? (
                              <>
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                </span>
                                <Navigation className="h-3.5 w-3.5" />
                                <span>Track</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                <span>Route</span>
                              </>
                            )}
                          </Button>
                        )}

                        {/* View Details Eye */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          onClick={() => setSelectedRide(ride)}
                          title="View Full Ride Details"
                        >
                          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ride Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-slate-200 dark:border-slate-800 animate-scale-in">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Ride #{selectedRide.id}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedRide.vehicleType} Booking • {selectedRide.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRide(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Ride Route Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Pickup Location</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedRide.pickup}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="h-3 w-3 rounded-full bg-red-500 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Dropoff Location</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedRide.drop}</p>
                  </div>
                </div>
              </div>

              <BookingLifecycleStepper ride={selectedRide} />

              {/* Fare Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <p className="text-xs text-slate-500">Trip Fare</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{selectedRide.fare}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <p className="text-xs text-slate-500">Distance</p>
                  <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">{selectedRide.distance}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-xs text-slate-500">OTP Code</p>
                  <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedRide.otp}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedRide.paymentMethod || 'Cash'} • {(selectedRide.paymentStatus || 'pending').replace('_', ' ')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge
                  variant={
                    selectedRide.status === 'requested'
                      ? 'outline'
                      : ['accepted', 'arrived', 'ongoing', 'in_progress'].includes(selectedRide.status)
                        ? 'warning'
                        : selectedRide.status === 'completed'
                          ? 'success'
                          : isTimeExpired(selectedRide)
                            ? 'warning'
                            : 'destructive'
                  }
                  className="capitalize font-bold"
                >
                  Status: {statusLabel(selectedRide)}
                </Badge>

                <div className="flex items-center gap-2">
                  {selectedRide.status === 'requested' && (
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 cursor-pointer shadow-sm"
                      onClick={() => {
                        const r = selectedRide;
                        setSelectedRide(null);
                        setAssignModalRide(r);
                      }}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Assign Driver
                    </Button>
                  )}
                  {selectedRide.status !== 'requested' && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 cursor-pointer shadow-sm"
                      onClick={() => {
                        const r = selectedRide;
                        setSelectedRide(null);
                        setTrackingRide(r);
                      }}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Track on Live Map
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedRide(null)} className="cursor-pointer">
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Driver Assignment Modal */}
      {assignModalRide && (
        <AssignDriverModal
          ride={assignModalRide}
          onClose={() => setAssignModalRide(null)}
          onAssigned={handleDriverAssigned}
        />
      )}

      {/* Live GPS Tracking Modal */}
      {trackingRide && (
        <LiveTrackingModal ride={trackingRide} onClose={() => setTrackingRide(null)} />
      )}
    </div>
  );
}

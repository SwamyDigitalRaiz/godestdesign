import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ChevronRight,
  Save,
  RotateCcw,
  Percent,
  Sliders,
  DollarSign,
  Users,
  Compass,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { useToast } from '../../../components/ui/toaster';

const DEFAULT_SETTINGS = {
  pricePerKmPerSeat: 3.5, // Simple Price Per Kilometer per seat
  minPricePerKmPerSeat: 2.0, // Floor rate driver cannot go below
  maxPricePerKmPerSeat: 5.5, // Ceiling rate driver cannot surge above
  commissionRate: 10,
  commissionType: '%', // '%' or 'FIX'
  extraPlatformFee: 15,
  stopoverPricingMultiplier: 100, // % distance rate for intermediate stopovers
  allowNegotiation: true,
  maxRiderDiscountPercent: 25,
  maxDriverSurgePercent: 30,
  maxSeatsPerRide: 4,
  maxTwoInRearSeat: true,
  allowLadiesOnlyRides: true,
  allowInstantBooking: true,
  freeCancellationMinutes: 60,
};

export function CarpoolPricingPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('godest_carpool_pricing_matrix');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          commissionRate: Number(parsed.commissionRate ?? parsed.platformCommissionPercent ?? 10),
          commissionType: parsed.commissionType || '%',
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  // Live Simulation state
  const [simDistanceKm, setSimDistanceKm] = useState(150);
  const [simSeats, setSimSeats] = useState(3);

  const calculateSimulation = () => {
    // Pure Price Per Kilometer per seat formula (No 10km blocks, no minimum base fare per seat)
    const rawSeatFare = Math.round(simDistanceKm * settings.pricePerKmPerSeat);
    const platformFee = Number(settings.extraPlatformFee) || 0;
    const riderTotalPerSeat = rawSeatFare + platformFee;
    const totalCollected = riderTotalPerSeat * simSeats;
    
    const commRate = Number(settings.commissionRate) || 0;
    const commission = settings.commissionType === 'FIX'
      ? Math.round(commRate)
      : Math.round((rawSeatFare * simSeats) * (commRate / 100));

    const hostNetPayout = Math.max(0, (rawSeatFare * simSeats) - commission);

    return {
      seatFare: rawSeatFare,
      riderTotalPerSeat,
      totalCollected,
      commission,
      hostNetPayout,
    };
  };

  const sim = calculateSimulation();

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('godest_carpool_pricing_matrix', JSON.stringify(settings));
      setTimeout(() => {
        setIsSaving(false);
        toast({
          title: 'Carpool Pricing Saved',
          description: `Rate set to ₹${settings.pricePerKmPerSeat}/KM per seat.`,
          variant: 'success',
        });
      }, 300);
    } catch (e) {
      setIsSaving(false);
      toast({
        title: 'Error saving settings',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('godest_carpool_pricing_matrix');
    toast({
      title: 'Reset to Factory Defaults',
      description: 'Standard ₹3.5/KM per seat rate restored.',
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Car Pool</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Pricing & Operational Rules</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="h-7 w-7 text-primary" />
            Car Pool Pricing & Fare Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure price per kilometer per seat, platform commission rate, and dynamic negotiation bounds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleReset} className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 bg-primary text-white hover:bg-primary/90">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Matrix'}
          </Button>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Per KM Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{settings.pricePerKmPerSeat}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Per seat / kilometer</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Compass className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Platform Take Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {settings.commissionType === '%' ? `${settings.commissionRate}%` : `₹${settings.commissionRate} FIX`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">+ ₹{settings.extraPlatformFee} rider booking fee</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 dark:bg-emerald-950/40">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bidding Bounds</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                -{settings.maxRiderDiscountPercent}% / +{settings.maxDriverSurgePercent}%
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Rider bid vs Host ask range</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 dark:bg-indigo-950/40">
              <Sliders className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pricing & Negotiation (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Distance & Seat Matrix */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-800/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Distance Rate Calculation (Price Per Kilometer)
              </CardTitle>
              <CardDescription className="text-xs">
                Direct calculation: Total KM × Price per KM per seat. Free publishing with zero upfront recharge.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Price per KM per Seat (₹)
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      step="0.5"
                      min="1"
                      max="20"
                      value={settings.pricePerKmPerSeat}
                      onChange={(e) => setSettings({ ...settings, pricePerKmPerSeat: Number(e.target.value) || 0 })}
                      className="pr-12 text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">₹ / KM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">E.g., 200 KM = ₹{200 * settings.pricePerKmPerSeat} / seat.</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Platform Commission
                  </Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        min="0"
                        step={settings.commissionType === '%' ? '0.5' : '1'}
                        value={settings.commissionRate}
                        onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) || 0 })}
                        className="text-sm font-semibold"
                        placeholder="e.g. 10"
                      />
                    </div>

                    {/* FIX vs % Toggle Switch (Identical to Bike Auto) */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, commissionType: 'FIX' })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                          settings.commissionType === 'FIX'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        FIX (₹)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, commissionType: '%' })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                          settings.commissionType === '%'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {settings.commissionType === '%'
                      ? `Platform keeps ${settings.commissionRate}% of each ride fare`
                      : `Platform charges flat ₹${settings.commissionRate} per trip regardless of distance`}
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Rider Platform Fee (₹)
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.extraPlatformFee}
                      onChange={(e) => setSettings({ ...settings, extraPlatformFee: Number(e.target.value) || 0 })}
                      className="pr-12 text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">₹ Fee</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Fixed facilitation fee per passenger.</p>
                </div>
              </div>

              {/* Driver Slider Allowed Limits & Stopover Multiplier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Host Min Price per KM (₹)
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={settings.minPricePerKmPerSeat}
                      onChange={(e) => setSettings({ ...settings, minPricePerKmPerSeat: Number(e.target.value) || 0 })}
                      className="pr-12 text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">₹ Min</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Driver slider floor limit (prevents undercharging).</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Host Max Price per KM (₹)
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      step="0.5"
                      min="2"
                      max="20"
                      value={settings.maxPricePerKmPerSeat}
                      onChange={(e) => setSettings({ ...settings, maxPricePerKmPerSeat: Number(e.target.value) || 0 })}
                      className="pr-12 text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">₹ Max</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Driver slider ceiling limit (prevents surge extortion).</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Stopover Distance Rate (%)
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      step="5"
                      min="50"
                      max="150"
                      value={settings.stopoverPricingMultiplier}
                      onChange={(e) => setSettings({ ...settings, stopoverPricingMultiplier: Number(e.target.value) || 0 })}
                      className="pr-10 text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Pro-rata multiplier for boarding at intermediate stops.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Dynamic Negotiation & Bidding Controls */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-800/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Dynamic Negotiation & Fare Bidding Engine
              </CardTitle>
              <CardDescription className="text-xs">
                Allow passengers to counter-offer and hosts to accept or increase fare within defined limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Enable In-App Fare Negotiation</p>
                  <p className="text-[11px] text-slate-500">Allows rider to bid a lower fare and driver to negotiate.</p>
                </div>
                <Switch
                  checked={settings.allowNegotiation}
                  onCheckedChange={(val) => setSettings({ ...settings, allowNegotiation: val })}
                />
              </div>

              {settings.allowNegotiation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Rider Max Discount (%)
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        type="number"
                        min="5"
                        max="50"
                        value={settings.maxRiderDiscountPercent}
                        onChange={(e) => setSettings({ ...settings, maxRiderDiscountPercent: Number(e.target.value) || 0 })}
                        className="pr-10 text-sm font-semibold"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">-%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Lowest counter-offer rider can propose.</p>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Host Max Price Hike (%)
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        type="number"
                        min="5"
                        max="60"
                        value={settings.maxDriverSurgePercent}
                        onChange={(e) => setSettings({ ...settings, maxDriverSurgePercent: Number(e.target.value) || 0 })}
                        className="pr-10 text-sm font-semibold"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">+%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Maximum price host can ask above base.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Simulator */}
        <div className="space-y-6">
          <Card className="border border-primary/30 shadow-md bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 dark:from-slate-900 dark:to-slate-900">
            <CardHeader className="pb-3 border-b border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Fare Simulation (Per KM)
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Formula: {simDistanceKm} KM × ₹{settings.pricePerKmPerSeat}/KM = ₹{Math.round(simDistanceKm * settings.pricePerKmPerSeat)} / seat.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Trip Distance:</span>
                    <span className="text-primary font-bold">{simDistanceKm} KM</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="600"
                    step="1"
                    value={simDistanceKm}
                    onChange={(e) => setSimDistanceKm(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>1 km</span>
                    <span>250 km</span>
                    <span>600 km</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Passengers:</span>
                    <span className="text-primary font-bold">{simSeats} Seats</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSimSeats(s)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          simSeats === s
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {s} {s === 1 ? 'Seat' : 'Seats'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Seat Fare ({simDistanceKm} km × ₹{settings.pricePerKmPerSeat}):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{sim.seatFare} / seat</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Platform Booking Fee:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">+₹{settings.extraPlatformFee}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Rider Total Per Seat:</span>
                  <span className="font-bold text-primary">₹{sim.riderTotalPerSeat}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Pool Collected ({simSeats} seats):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{sim.totalCollected}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>
                    GoDest Commission ({settings.commissionType === '%' ? `${settings.commissionRate}%` : `₹${settings.commissionRate} Flat`}):
                  </span>
                  <span className="font-semibold">₹{sim.commission}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-lg">
                  <span>Host Net Payout:</span>
                  <span>₹{sim.hostNetPayout}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Policy Switches */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-800/50">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Operational & Safety Switches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Max 2 in Rear Seat Rule</p>
                  <p className="text-[11px] text-slate-500">Encourage comfort (middle seat empty).</p>
                </div>
                <Switch
                  checked={settings.maxTwoInRearSeat}
                  onCheckedChange={(val) => setSettings({ ...settings, maxTwoInRearSeat: val })}
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Ladies-Only Carpool Filter</p>
                  <p className="text-[11px] text-slate-500">Allow female drivers and riders to filter exclusively.</p>
                </div>
                <Switch
                  checked={settings.allowLadiesOnlyRides}
                  onCheckedChange={(val) => setSettings({ ...settings, allowLadiesOnlyRides: val })}
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Instant Booking Default</p>
                  <p className="text-[11px] text-slate-500">Auto-confirm bookings without host manual approval.</p>
                </div>
                <Switch
                  checked={settings.allowInstantBooking}
                  onCheckedChange={(val) => setSettings({ ...settings, allowInstantBooking: val })}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Max Seats per Ride</Label>
                <div className="mt-1.5 flex gap-2">
                  {[3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSettings({ ...settings, maxSeatsPerRide: num })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        settings.maxSeatsPerRide === num
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

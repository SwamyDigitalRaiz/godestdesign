import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useVehicleStore } from '../../../store/vehicleStore';
import { useToast } from '../../../components/ui/toaster';
import {
  Car,
  Bike,
  Upload,
  Info,
  Check,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  MapPin,
  Users,
  Shield,
  CloudRain,
  Eye,
  Sliders,
  Sparkles,
  HelpCircle,
  Clock,
  X
} from 'lucide-react';

export function AddVehiclePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addVehicle, updateVehicle, vehicles, fetchVehicles } = useVehicleStore();
  const { toast } = useToast();

  const passedVehicle = location.state?.vehicle;
  const isEdit = Boolean(id || passedVehicle);

  const [form, setForm] = useState({
    name: '',
    capacity: 1,
    description: '',
    image: '',
    mapImage: '',
    minKmDistance: 1.5,
    minKmPrice: 35,
    afterKmPrice: 12,
    commissionRate: 10,
    commissionType: '%', // '%' or 'FIX'
    extraCharge: 5,
    freeWaitingMinutes: 5,
    waitingChargePerMinute: 2,
    captainAcceptSeconds: 15,
    searchTimeoutSeconds: 90,
    biddingEnabled: false,
    minFare: 30,
    maxFare: 5000,
    weatherBad: false,
    weatherSurgeType: 'flat', // 'flat' (+₹) or 'multiplier' (x)
    weatherSurgeValue: 15,
    homeVisible: true,
    status: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [mapImagePreview, setMapImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Populate from existing vehicle if editing
  useEffect(() => {
    let veh = passedVehicle;
    if (!veh && id && vehicles?.length) {
      veh = vehicles.find((v) => (v._id === id || v.id === id || v.customId === id));
    }
    if (veh) {
      setForm({
        name: veh.name || '',
        capacity: Number(veh.capacity ?? 1),
        description: veh.description || '',
        image: veh.image || '',
        mapImage: veh.mapImage || '',
        minKmDistance: Number(veh.minKmDistance ?? 1.5),
        minKmPrice: Number(veh.minKmPrice ?? 35),
        afterKmPrice: Number(veh.afterKmPrice ?? 12),
        commissionRate: Number(veh.commissionRate ?? 10),
        commissionType: veh.commissionType || '%',
        extraCharge: Number(veh.extraCharge ?? 5),
        freeWaitingMinutes: Number(veh.freeWaitingMinutes ?? 5),
        waitingChargePerMinute: Number(veh.waitingChargePerMinute ?? 2),
        captainAcceptSeconds: Number(veh.captainAcceptSeconds ?? 15),
        searchTimeoutSeconds: Number(veh.searchTimeoutSeconds ?? 90),
        biddingEnabled: Boolean(veh.biddingEnabled),
        minFare: Number(veh.minFare ?? 30),
        maxFare: Number(veh.maxFare ?? 5000),
        weatherBad: Boolean(veh.weatherBad),
        weatherSurgeType: veh.weatherSurgeType || 'flat',
        weatherSurgeValue: Number(veh.weatherSurgeValue ?? 15),
        homeVisible: veh.homeVisible !== false,
        status: veh.status !== false,
      });
      if (veh.image) setImagePreview(veh.image);
      if (veh.mapImage) setMapImagePreview(veh.mapImage);
    } else if (id && (!vehicles || vehicles.length === 0)) {
      fetchVehicles();
    }
  }, [id, passedVehicle, vehicles, fetchVehicles]);

  // Handle local file previews
  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'vehicle') {
          setImagePreview(reader.result);
          setForm((prev) => ({ ...prev, image: reader.result }));
        } else {
          setMapImagePreview(reader.result);
          setForm((prev) => ({ ...prev, mapImage: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({
        title: 'Vehicle Name Required',
        description: 'Please enter a name for the vehicle category (e.g. City Bike or City Auto).',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Default placeholder images if none uploaded
      const finalVehicle = {
        ...form,
        image:
          form.image ||
          (form.capacity === 1
            ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1597687210367-a4915552d896?w=300&auto=format&fit=crop&q=80'),
        mapImage:
          form.mapImage ||
          (form.capacity === 1
            ? 'https://cdn-icons-png.flaticon.com/512/3198/3198336.png'
            : 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png'),
        minKmDistance: Number(form.minKmDistance),
        minKmPrice: Number(form.minKmPrice),
        afterKmPrice: Number(form.afterKmPrice),
        commissionRate: Number(form.commissionRate),
        extraCharge: Number(form.extraCharge),
        freeWaitingMinutes: Number(form.freeWaitingMinutes),
        waitingChargePerMinute: Number(form.waitingChargePerMinute),
        captainAcceptSeconds: Number(form.captainAcceptSeconds),
        searchTimeoutSeconds: Number(form.searchTimeoutSeconds),
        minFare: Number(form.minFare),
        maxFare: Number(form.maxFare),
        weatherBad: Boolean(form.weatherBad),
        weatherSurgeType: form.weatherSurgeType || 'flat',
        weatherSurgeValue: Number(form.weatherSurgeValue || 15),
      };

      if (isEdit) {
        const targetId = id || passedVehicle?._id || passedVehicle?.id || passedVehicle?.customId;
        await updateVehicle(targetId, finalVehicle);
        toast({
          title: 'Vehicle Updated Successfully!',
          description: `${finalVehicle.name} category has been updated.`,
        });
      } else {
        const res = await addVehicle(finalVehicle);
        if (res && res.success === false) {
          toast({
            title: 'Failed to Add Vehicle',
            description: res.message || 'Error occurred while saving vehicle.',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }

        toast({
          title: 'Vehicle Added Successfully!',
          description: `${finalVehicle.name} has been created and added to the active vehicle list.`,
        });
      }
      navigate('/bike-auto/vehicles');
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || (isEdit ? 'Failed to update vehicle.' : 'Failed to add vehicle.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Bike Auto</span>
            <ChevronRight className="h-3 w-3" />
            <Link to="/bike-auto/vehicles" className="hover:text-primary transition-colors">Vehicles</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">
              {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isEdit
              ? 'Modify rate cards, commission split, surge pricing, and live category settings.'
              : 'Configure vehicle category identity, base distance rate cards, commission split, and dynamic bidding rules.'}
          </p>
        </div>

        <Link to="/bike-auto/vehicles">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicle List
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Visual Assets (Vehicle Image & Map Pin) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Vehicle Illustrations & Map Markers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* App Vehicle Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    Vehicle Image (App Carousel)
                    <span className="text-xs font-normal text-slate-400">(2D / 3D Illustration)</span>
                  </label>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-slate-900/30 relative">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Vehicle preview"
                        className="h-28 object-contain mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setForm({ ...form, image: '' });
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-xl bg-primary/20 text-slate-950 flex items-center justify-center mx-auto shadow-sm">
                        <Bike className="h-6 w-6 text-slate-950" />
                      </div>
                      <p className="text-xs text-slate-500">
                        PNG or WebP with transparent background recommended
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <input
                      type="file"
                      id="vehicle-image-upload"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'vehicle')}
                      className="hidden"
                    />
                    <label
                      htmlFor="vehicle-image-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              {/* Map Marker Pin */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    Map Image (Top-Down GPS Pin)
                    <span className="text-xs font-normal text-slate-400">(Moving live marker)</span>
                  </label>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-slate-900/30 relative">
                  {mapImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={mapImagePreview}
                        alt="Map pin preview"
                        className="h-28 object-contain mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMapImagePreview(null);
                          setForm({ ...form, mapImage: '' });
                        }}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center mx-auto shadow-sm">
                        <MapPin className="h-6 w-6 text-secondary" />
                      </div>
                      <p className="text-xs text-slate-500">
                        Top-down 48x48 or 64x64 PNG marker for live GPS tracking
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <input
                      type="file"
                      id="map-image-upload"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'map')}
                      className="hidden"
                    />
                    <label
                      htmlFor="map-image-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Basic Identity (Name, Capacity, Description) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              General Category Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. City Bike, City Auto"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Passenger Capacity <span className="text-xs font-normal text-slate-400">(Max riders)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    placeholder="Enter Passenger Capacity (e.g. 1 for Bike, 3 for Auto)"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  />
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Enter a brief summary shown under vehicle category in user app..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Core Fare & Distance Matrix */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Distance & Fare Calculation Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Min KM Distance <span className="text-xs text-slate-400">(Base Km)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 1.5"
                    value={form.minKmDistance}
                    onChange={(e) => setForm({ ...form, minKmDistance: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    KM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Starting distance included in base fare</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Min KM Price <span className="text-xs text-slate-400">(Base Fare)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 35"
                    value={form.minKmPrice}
                    onChange={(e) => setForm({ ...form, minKmPrice: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ₹
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Fixed starting price for base distance</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  After KM Price <span className="text-xs text-slate-400">(Per Km)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 14"
                    value={form.afterKmPrice}
                    onChange={(e) => setForm({ ...form, afterKmPrice: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ₹/KM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Charged for every km after base distance</p>
              </div>
            </div>

            {/* Commission Rate & Extra Platform Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Commission Rate
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="e.g. 10"
                      value={form.commissionRate}
                      onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                    />
                  </div>

                  {/* FIX vs % Toggle Switch */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, commissionType: 'FIX' })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        form.commissionType === 'FIX'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      FIX (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, commissionType: '%' })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        form.commissionType === '%'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {form.commissionType === '%'
                    ? `Platform keeps ${form.commissionRate}% of each ride fare`
                    : `Platform charges flat ₹${form.commissionRate} per ride regardless of distance`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Extra Charge <span className="text-xs text-slate-400">(Platform Fee)</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={form.extraCharge}
                    onChange={(e) => setForm({ ...form, extraCharge: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ₹
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Fixed platform / booking fee added directly to rider bill</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Captain search & waiting charges</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Captain accept timer
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="5"
                      max="120"
                      value={form.captainAcceptSeconds}
                      onChange={(e) => setForm({ ...form, captainAcceptSeconds: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">SEC</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">How long each captain has to accept</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Search timeout
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="20"
                      max="300"
                      value={form.searchTimeoutSeconds}
                      onChange={(e) => setForm({ ...form, searchTimeoutSeconds: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">SEC</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Stop searching if nobody accepts</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Free waiting time
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={form.freeWaitingMinutes}
                      onChange={(e) => setForm({ ...form, freeWaitingMinutes: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">MIN</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">After captain taps I’m here</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Extra wait charge
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.waitingChargePerMinute}
                      onChange={(e) => setForm({ ...form, waitingChargePerMinute: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₹/MIN</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Charged after free waiting expires</p>
                </div>
              </div>
            </div>

            {/* Live Pricing Preview Simulation */}
            {(() => {
              const baseTrip =
                Number(form.minKmPrice) +
                Math.max(0, 5.0 - Number(form.minKmDistance)) * Number(form.afterKmPrice) +
                Number(form.extraCharge);
              const rainTrip =
                form.weatherSurgeType === 'multiplier'
                  ? Math.round(baseTrip * (Number(form.weatherSurgeValue) || 1))
                  : baseTrip + (Number(form.weatherSurgeValue) || 0);

              return (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Sample 5.0 KM Trip Simulation: </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          Base ₹{form.minKmPrice || 0} ({form.minKmDistance || 0} km) + Extra {Math.max(0, 5.0 - Number(form.minKmDistance || 0)).toFixed(1)} km @ ₹{form.afterKmPrice || 0} + ₹{form.extraCharge || 0} Fee
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                        Normal: ₹{baseTrip}
                      </span>
                      {form.weatherBad && (
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800 px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                          <CloudRain className="h-3.5 w-3.5 text-blue-600" />
                          Rain Mode: ₹{rainTrip} ({form.weatherSurgeType === 'multiplier' ? `${form.weatherSurgeValue}x` : `+₹${form.weatherSurgeValue}`})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Card 4: Bidding System & Real-Time Operational Toggles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              Bidding Rules & Operational Switches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle 1: Bidding / Preferred Price System */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Set your preferred price / Bidding System
                    </span>
                    <Badge variant={form.biddingEnabled ? 'success' : 'secondary'} className="text-[10px]">
                      {form.biddingEnabled ? 'Active' : 'Disabled (Fixed Price)'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enable inDrive-style real-time fare negotiation between rider and driver within min/max bounds.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.biddingEnabled}
                    onChange={(e) => setForm({ ...form, biddingEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Conditional Minimum & Maximum Fare inputs when Bidding is enabled */}
              {form.biddingEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 animate-slide-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Minimum Fare <span className="text-slate-400">(Floor Price)</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 30"
                        value={form.minFare}
                        onChange={(e) => setForm({ ...form, minFare: e.target.value })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        ₹
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Protects drivers from unrealistically low rider bids</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Maximum Fare <span className="text-slate-400">(Ceiling Price)</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 500"
                        value={form.maxFare}
                        onChange={(e) => setForm({ ...form, maxFare: e.target.value })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        ₹
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Prevents overpricing and regulatory price gouging</p>
                  </div>
                </div>
              )}
            </div>

            {/* Weather Bad / Rain Surge System with Configurable Pricing */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <CloudRain className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        Bad Weather / Rain Surge Pricing
                      </span>
                      <Badge variant={form.weatherBad ? 'default' : 'secondary'} className={`text-[10px] ${form.weatherBad ? 'bg-blue-600 text-white' : ''}`}>
                        {form.weatherBad ? 'Surge Active' : 'Off (Standard Rates)'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Compensates drivers during rain & bad weather to maintain vehicle supply and prevent driver order rejection.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.weatherBad}
                    onChange={(e) => setForm({ ...form, weatherBad: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Configurable Rain Pricing Inputs */}
              {form.weatherBad && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 animate-slide-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Rain Surge Price Model
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, weatherSurgeType: 'flat' })}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                          form.weatherSurgeType === 'flat'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Flat Fee (+₹ FIX)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, weatherSurgeType: 'multiplier' })}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                          form.weatherSurgeType === 'multiplier'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Multiplier (x MULT)
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {form.weatherSurgeType === 'flat'
                        ? 'Adds a fixed rain allowance directly onto the customer trip bill'
                        : 'Multiplies total calculated fare (e.g. 1.25x = 25% rain surge)'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {form.weatherSurgeType === 'flat' ? 'Rain Allowance Amount' : 'Surge Multiplier Factor'}
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step={form.weatherSurgeType === 'multiplier' ? '0.05' : '1'}
                        min="0"
                        placeholder={form.weatherSurgeType === 'multiplier' ? '1.25' : '15'}
                        value={form.weatherSurgeValue}
                        onChange={(e) => setForm({ ...form, weatherSurgeValue: e.target.value })}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        {form.weatherSurgeType === 'flat' ? '₹' : 'x'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {form.weatherSurgeType === 'flat'
                        ? `Riders pay +₹${form.weatherSurgeValue || 0} extra, passed as driver rain incentive`
                        : `Customer fares scaled by ${form.weatherSurgeValue || 1}x during active rain`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Other 2 Operational Switches: Home Visible & Active Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Home Visible Status */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Home Visible</p>
                    <p className="text-[10px] text-slate-400">Shown in customer app home carousel</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.homeVisible}
                    onChange={(e) => setForm({ ...form, homeVisible: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Status */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Active Status</p>
                    <p className="text-[10px] text-slate-400">Category is live for customer booking</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/bike-auto/vehicles">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="maat"
            disabled={submitting}
            className="px-6 min-w-[140px]"
          >
            {submitting ? 'Saving...' : (isEdit ? 'Update Vehicle Category' : 'Submit & Save Vehicle')}
          </Button>
        </div>
      </form>
    </div>
  );
}

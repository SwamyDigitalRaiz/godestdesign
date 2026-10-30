import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { ImageDropzone } from '../../components/ui/image-dropzone';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { useToast } from '../../components/ui/toaster';
import { BannersTab } from './banners';
import {
  Settings,
  Sparkles,
  Sliders,
  ShieldAlert,
  Image as ImageIcon,
  FileText,
  Save,
  RotateCcw,
  Bike,
  Car,
  Bus,
  Users,
  Compass,
  AlertTriangle,
  Zap,
  PhoneCall,
  Clock,
  MapPin,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Pencil,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Info,
  Smartphone,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Radio,
  Upload,
} from 'lucide-react';

export function AppSettingsPage() {
  const {
    settings,
    loading,
    fetchSettings,
    fetchIntroScreens,
    updateGeneral,
    updateFeatureToggle,
    updateDispatchRules,
    updateLocationSettings,
    updateInactivityPolicy,
    updatePolicies,
    addIntroImage,
    updateIntroImage,
    deleteIntroImage,
    toggleIntroImage,
    moveIntroImage,
    resetDefaults,
  } = useAppSettingsStore();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('features'); // 'features' | 'general' | 'location' | 'dispatch' | 'inactivity' | 'banners' | 'introimages' | 'policies'

  // Local state for forms
  const [generalForm, setGeneralForm] = useState({ ...settings.general });
  const [dispatchForm, setDispatchForm] = useState({ ...settings.dispatchRules });
  const [inactivityForm, setInactivityForm] = useState({ ...settings.inactivityPolicy });
  const [policyTargetApp, setPolicyTargetApp] = useState('user'); // 'user' | 'driver'
  const [userPoliciesForm, setUserPoliciesForm] = useState({
    termsOfService: settings.policies?.user?.termsOfService || settings.policies?.termsOfService || '',
    privacyPolicy: settings.policies?.user?.privacyPolicy || settings.policies?.privacyPolicy || '',
    refundDisputePolicy: settings.policies?.user?.refundDisputePolicy || settings.policies?.refundDisputePolicy || '',
  });
  const [driverPoliciesForm, setDriverPoliciesForm] = useState({
    termsOfService: settings.policies?.driver?.termsOfService || '',
    privacyPolicy: settings.policies?.driver?.privacyPolicy || '',
    refundDisputePolicy: settings.policies?.driver?.refundDisputePolicy || '',
  });
  const [locationForm, setLocationForm] = useState({
    defaultCity: settings.locationSettings?.defaultCity || 'Hyderabad',
    defaultCenterLat: settings.locationSettings?.defaultCenter?.[0] || 17.4435,
    defaultCenterLng: settings.locationSettings?.defaultCenter?.[1] || 78.3772,
    gpsUpdateIntervalSeconds: settings.locationSettings?.gpsUpdateIntervalSeconds || 3,
    locationAccuracyThresholdMeters: settings.locationSettings?.locationAccuracyThresholdMeters || 15,
    highAccuracyMode: settings.locationSettings?.highAccuracyMode !== false,
    geofenceTrackingEnabled: settings.locationSettings?.geofenceTrackingEnabled !== false,
    maxNearbyDriverSearchRadiusKm: settings.locationSettings?.maxNearbyDriverSearchRadiusKm || 4.0,
    serviceableCities: settings.locationSettings?.serviceableCities || ['Hyderabad', 'Secunderabad', 'Vijayawada', 'Guntur', 'Visakhapatnam', 'Surat'],
    mapProvider: settings.locationSettings?.mapProvider || 'osm',
    googleMapsApiKey: settings.locationSettings?.googleMapsApiKey || '',
    enableReverseGeocodingCache: settings.locationSettings?.enableReverseGeocodingCache !== false,
  });
  const [newCityInput, setNewCityInput] = useState('');

  // Fetch settings & intro screens from backend on mount dynamically
  useEffect(() => {
    fetchSettings().then((res) => {
      if (res?.settings) {
        setGeneralForm({ ...res.settings.general });
        setDispatchForm({ ...res.settings.dispatchRules });
        setInactivityForm({ ...res.settings.inactivityPolicy });
        if (res.settings.policies) {
          const pol = res.settings.policies;
          setUserPoliciesForm({
            termsOfService: pol.user?.termsOfService || pol.termsOfService || '',
            privacyPolicy: pol.user?.privacyPolicy || pol.privacyPolicy || '',
            refundDisputePolicy: pol.user?.refundDisputePolicy || pol.refundDisputePolicy || '',
          });
          setDriverPoliciesForm({
            termsOfService: pol.driver?.termsOfService || '',
            privacyPolicy: pol.driver?.privacyPolicy || '',
            refundDisputePolicy: pol.driver?.refundDisputePolicy || '',
          });
        }
        if (res.settings.locationSettings) {
          setLocationForm({
            defaultCity: res.settings.locationSettings.defaultCity || 'Hyderabad',
            defaultCenterLat: res.settings.locationSettings.defaultCenter?.[0] || 17.4435,
            defaultCenterLng: res.settings.locationSettings.defaultCenter?.[1] || 78.3772,
            gpsUpdateIntervalSeconds: res.settings.locationSettings.gpsUpdateIntervalSeconds || 3,
            locationAccuracyThresholdMeters: res.settings.locationSettings.locationAccuracyThresholdMeters || 15,
            highAccuracyMode: res.settings.locationSettings.highAccuracyMode !== false,
            geofenceTrackingEnabled: res.settings.locationSettings.geofenceTrackingEnabled !== false,
            maxNearbyDriverSearchRadiusKm: res.settings.locationSettings.maxNearbyDriverSearchRadiusKm || 4.0,
            serviceableCities: res.settings.locationSettings.serviceableCities || ['Hyderabad', 'Secunderabad', 'Vijayawada', 'Guntur', 'Visakhapatnam', 'Surat'],
            mapProvider: res.settings.locationSettings.mapProvider || 'osm',
            googleMapsApiKey: res.settings.locationSettings.googleMapsApiKey || '',
            enableReverseGeocodingCache: res.settings.locationSettings.enableReverseGeocodingCache !== false,
          });
        }
      }
    });
    fetchIntroScreens();
  }, [fetchSettings, fetchIntroScreens]);

  // ── Intro Images State (matching Solo Hearts admin) ───────
  const introImages = settings.introImages || [];
  const [introFilterType, setIntroFilterType] = useState('all'); // 'all' | 'user' | 'driver'
  const [isIntroAddOpen, setIsIntroAddOpen] = useState(false);
  const [introForm, setIntroForm] = useState({
    name: '',
    tag: '',
    type: 'user',
    imageFile: null,
    imageBase64: '',
  });

  const [isIntroEditOpen, setIsIntroEditOpen] = useState(false);
  const [selectedIntroImage, setSelectedIntroImage] = useState(null);
  const [introEditForm, setIntroEditForm] = useState({
    name: '',
    tag: '',
    type: 'user',
    imageFile: null,
    imageBase64: '',
  });

  const [deleteIntroConfirmOpen, setDeleteIntroConfirmOpen] = useState(false);
  const [introToDelete, setIntroToDelete] = useState(null);

  // Reset confirmation modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Save General
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    await updateGeneral(generalForm);
    toast({
      title: 'General Settings Saved',
      description: 'Platform profile and version controls have been updated.',
    });
  };

  // Save Dispatch Rules
  const handleSaveDispatch = async (e) => {
    e.preventDefault();
    await updateDispatchRules(dispatchForm);
    toast({
      title: 'Dispatch Rules Saved',
      description: 'Ride timeouts, search radius, and cancellation fees updated.',
    });
  };

  // Save Location & Telematics Settings
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    const payload = {
      defaultCity: locationForm.defaultCity,
      defaultCenter: [Number(locationForm.defaultCenterLat), Number(locationForm.defaultCenterLng)],
      gpsUpdateIntervalSeconds: Number(locationForm.gpsUpdateIntervalSeconds),
      locationAccuracyThresholdMeters: Number(locationForm.locationAccuracyThresholdMeters),
      highAccuracyMode: Boolean(locationForm.highAccuracyMode),
      geofenceTrackingEnabled: Boolean(locationForm.geofenceTrackingEnabled),
      maxNearbyDriverSearchRadiusKm: Number(locationForm.maxNearbyDriverSearchRadiusKm),
      serviceableCities: locationForm.serviceableCities,
      mapProvider: locationForm.mapProvider,
      googleMapsApiKey: locationForm.googleMapsApiKey,
      enableReverseGeocodingCache: Boolean(locationForm.enableReverseGeocodingCache),
    };
    await updateLocationSettings(payload);
    toast({
      title: 'Location Settings Saved',
      description: 'Geolocation tracking parameters and telematics configurations updated.',
    });
  };

  // Preset location coordinate helper
  const handlePresetCity = (cityName, lat, lng) => {
    setLocationForm((prev) => ({
      ...prev,
      defaultCity: cityName,
      defaultCenterLat: lat,
      defaultCenterLng: lng,
    }));
    toast({
      title: `${cityName} Coordinates Selected`,
      description: `Default hub coordinates set to [${lat}, ${lng}].`,
    });
  };

  // Add Serviceable City tag
  const handleAddCity = () => {
    if (!newCityInput.trim()) return;
    const trimmed = newCityInput.trim();
    if (!locationForm.serviceableCities.includes(trimmed)) {
      setLocationForm((prev) => ({
        ...prev,
        serviceableCities: [...prev.serviceableCities, trimmed],
      }));
    }
    setNewCityInput('');
  };

  // Remove Serviceable City tag
  const handleRemoveCity = (cityToRemove) => {
    setLocationForm((prev) => ({
      ...prev,
      serviceableCities: prev.serviceableCities.filter((c) => c !== cityToRemove),
    }));
  };

  // Save Inactivity Policy
  const handleSaveInactivity = async (e) => {
    e.preventDefault();
    await updateInactivityPolicy(inactivityForm);
    toast({
      title: 'Driver Policy Saved',
      description: 'Inactivity timeouts and compliance thresholds updated.',
    });
  };

  // Save Policies
  const handleSavePolicies = async (e) => {
    e.preventDefault();
    if (policyTargetApp === 'driver') {
      await updatePolicies({
        targetApp: 'driver',
        ...driverPoliciesForm,
      });
      toast({
        title: 'Driver Partner Policies Saved',
        description: 'Terms of Service, Privacy Policy, and Settlement Guidelines updated for the Driver App.',
      });
    } else {
      await updatePolicies({
        targetApp: 'user',
        ...userPoliciesForm,
      });
      toast({
        title: 'User Policies Saved',
        description: 'Terms of Service, Privacy Policy, and Refund Guidelines updated for the User App.',
      });
    }
  };

  // ── Intro Images Handlers (Solo Hearts style) ────────────
  const handleAddIntroSubmit = (e) => {
    e.preventDefault();
    if (!introForm.name?.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please specify an image name or title.',
        variant: 'destructive',
      });
      return;
    }
    if (!introForm.imageBase64) {
      toast({
        title: 'Image File Required',
        description: 'Please select an image file to upload.',
        variant: 'destructive',
      });
      return;
    }

    addIntroImage({
      name: introForm.name,
      tag: introForm.tag || `Walkthrough Step ${introImages.length + 1}`,
      imageUrl: introForm.imageBase64,
      type: introForm.type || 'user',
    });

    toast({
      title: 'Introduction Image Added',
      description: `New onboarding slide for ${introForm.type === 'driver' ? 'Driver App' : 'User App'} has been uploaded.`,
    });

    setIsIntroAddOpen(false);
    setIntroForm({ name: '', tag: '', type: 'user', imageFile: null, imageBase64: '' });
  };

  const handleEditIntroClick = (img) => {
    setSelectedIntroImage(img);
    setIntroEditForm({
      name: img.name || '',
      tag: img.tag || '',
      type: img.type || 'user',
      imageFile: null,
      imageBase64: img.imageUrl || '',
    });
    setIsIntroEditOpen(true);
  };

  const handleEditIntroSubmit = (e) => {
    e.preventDefault();
    if (!selectedIntroImage) return;

    updateIntroImage(selectedIntroImage._id || selectedIntroImage.id, {
      name: introEditForm.name,
      tag: introEditForm.tag,
      type: introEditForm.type || 'user',
      imageUrl: introEditForm.imageBase64 || selectedIntroImage.imageUrl,
    });

    toast({
      title: 'Introduction Image Updated',
      description: 'Walkthrough screen details have been updated.',
    });

    setIsIntroEditOpen(false);
    setSelectedIntroImage(null);
  };

  const handleToggleIntroImage = (id) => {
    toggleIntroImage(id);
    const img = introImages.find((item) => (item._id || item.id) === id);
    toast({
      title: img?.isActive ? 'Intro Image Disabled' : 'Intro Image Enabled',
      description: `Screen is now ${img?.isActive ? 'hidden' : 'active in app login flow'}.`,
    });
  };

  const handleDeleteIntroConfirm = () => {
    if (!introToDelete) return;
    deleteIntroImage(introToDelete._id || introToDelete.id);
    toast({
      title: 'Intro Image Removed',
      description: `"${introToDelete.name}" was removed from the walkthrough list.`,
    });
    setDeleteIntroConfirmOpen(false);
    setIntroToDelete(null);
  };

  const handleMoveIntro = (id, direction) => {
    moveIntroImage(id, direction);
    toast({
      title: 'Priority Updated',
      description: `Moved screen position ${direction}.`,
    });
  };

  const handleResetToDefaults = () => {
    resetDefaults();
    setGeneralForm({ ...settings.general });
    setDispatchForm({ ...settings.dispatchRules });
    setInactivityForm({ ...settings.inactivityPolicy });
    setPoliciesForm({ ...settings.policies });
    setResetModalOpen(false);
    toast({
      title: 'Defaults Restored',
      description: 'All system settings have been restored to initial factory defaults.',
    });
  };

  const TABS = [
    { id: 'features', label: 'Feature Toggles', icon: Sparkles, count: Object.keys(settings.featureToggles).length },
    { id: 'general', label: 'General & Versions', icon: Settings },
    { id: 'location', label: 'Location & Telematics', icon: MapPin },
    { id: 'dispatch', label: 'Dispatch & Trips', icon: Sliders },
    { id: 'inactivity', label: 'Driver Compliance', icon: ShieldAlert },
    { id: 'banners', label: '🖼️ App Banners', icon: ImageIcon, count: settings.banners?.length || 0 },
    { id: 'introimages', label: '✨ Intro Screens', icon: Smartphone, count: introImages.length },
    { id: 'policies', label: 'Legal & Policies', icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              App Settings & Configuration
            </h1>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0 font-medium text-xs">
              Live Core
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Control service availability, algorithmic dispatch radius, driver compliance thresholds, in-app banners, and version locks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: FEATURE TOGGLES */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Dynamic Service Kill-Switches
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggling any service immediately hides or exposes it in passenger & driver mobile apps in real-time without requiring app store updates.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mobility Services */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Bike Taxi Service</CardTitle>
                      <CardDescription className="text-xs">Quick two-wheeler rides</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.bikeTaxi}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('bikeTaxi', val);
                      toast({ title: `Bike Taxi ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Allows passengers to book single-seater bike rides with certified captains across active zones.
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Auto Rickshaw</CardTitle>
                      <CardDescription className="text-xs">Metered 3-wheeler rides</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.autoRickshaw}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('autoRickshaw', val);
                      toast({ title: `Auto Rickshaw ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Three-wheeler point-to-point transit with transparent upfront pricing and zero surge refusal.
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">City Cabs</CardTitle>
                      <CardDescription className="text-xs">Sedan, Prime & SUV cabs</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.rapidCabs}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('rapidCabs', val);
                      toast({ title: `City Cabs ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Air-conditioned 4-seater and 6-seater city cabs with GPS route monitoring and verified drivers.
              </CardContent>
            </Card>


            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Bus Bookings</CardTitle>
                      <CardDescription className="text-xs">Intercity coach ticketing</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.busBookings}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('busBookings', val);
                      toast({ title: `Bus Bookings ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Multi-operator intercity bus seat reservation, live boarding tracking, and M-Tickets.
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">EV Priority Dispatch</CardTitle>
                      <CardDescription className="text-xs">Green fleet incentive</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.electricVehiclePriority}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('electricVehiclePriority', val);
                      toast({ title: `EV Priority ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Favors electric 2W/3W/4W vehicles in initial dispatch waves to reduce carbon emissions.
              </CardContent>
            </Card>

            {/* Platform Logic Switches */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Night Surge Engine</CardTitle>
                      <CardDescription className="text-xs">Automated 1.2x–1.8x pricing</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.nightSurgeEngine}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('nightSurgeEngine', val);
                      toast({ title: `Night Surge ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Activates dynamic night multiplier between 23:00 PM and 05:00 AM across high-demand sectors.
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">In-Ride SOS Button</CardTitle>
                      <CardDescription className="text-xs">Police & control room link</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.sosPanicButton}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('sosPanicButton', val);
                      toast({ title: `SOS Button ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Exposes floating 1-tap SOS button in live ride screens with automatic police dispatch trigger.
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Auto-Dispatch</CardTitle>
                      <CardDescription className="text-xs">Smart driver batching</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.aiDriverDispatch}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('aiDriverDispatch', val);
                      toast({ title: `AI Dispatch ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Optimizes driver assignment using real-time traffic speeds and driver acceptance ratings.
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Cash to Driver</CardTitle>
                      <CardDescription className="text-xs">Physical currency collection</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.cashToDriver}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('cashToDriver', val);
                      toast({ title: `Cash Payments ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                Permits cash payment option with automated platform commission balance deduction from driver wallet.
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">In-App MAAT Wallet</CardTitle>
                      <CardDescription className="text-xs">Pre-paid balance & cashbacks</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.featureToggles.walletPayments}
                    onCheckedChange={(val) => {
                      updateFeatureToggle('walletPayments', val);
                      toast({ title: `Wallet Payments ${val ? 'Enabled' : 'Disabled'}` });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="text-xs text-slate-500 dark:text-slate-400">
                One-tap debit from passenger in-app wallet balance with instant post-trip ride settlement.
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL & APP VERSION LOCKS */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Identity */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Platform & Legal Identity
                </CardTitle>
                <CardDescription className="text-xs">
                  Official public details displayed across passenger receipts and support portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Application Brand Name</Label>
                  <Input
                    value={generalForm.appName}
                    onChange={(e) => setGeneralForm({ ...generalForm, appName: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Registered Company Legal Entity</Label>
                  <Input
                    value={generalForm.legalEntity}
                    onChange={(e) => setGeneralForm({ ...generalForm, legalEntity: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Customer Support Email</Label>
                    <Input
                      type="email"
                      value={generalForm.supportEmail}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Toll-Free Support Helpline</Label>
                    <Input
                      value={generalForm.supportPhone}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportPhone: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-red-600 dark:text-red-400">
                      Emergency SOS Hotline (24x7)
                    </Label>
                    <Input
                      value={generalForm.sosHelpline}
                      onChange={(e) => setGeneralForm({ ...generalForm, sosHelpline: e.target.value })}
                      className="h-9 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Operating Currency</Label>
                    <Input
                      value={generalForm.currency}
                      onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Headquarters Physical Address</Label>
                  <Input
                    value={generalForm.headquarters}
                    onChange={(e) => setGeneralForm({ ...generalForm, headquarters: e.target.value })}
                    className="h-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Mode & Version Control */}
            <div className="space-y-6">
              {/* Maintenance Card */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Platform Maintenance Mode
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Block ride requests temporarily during server maintenance windows
                      </CardDescription>
                    </div>
                    <Switch
                      checked={generalForm.maintenanceMode}
                      onCheckedChange={(val) => setGeneralForm({ ...generalForm, maintenanceMode: val })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Broadcast Maintenance Message</Label>
                    <textarea
                      value={generalForm.maintenanceMessage}
                      onChange={(e) => setGeneralForm({ ...generalForm, maintenanceMessage: e.target.value })}
                      rows={2}
                      className="w-full text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {generalForm.maintenanceMode && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Warning: Maintenance mode is currently ON. Riders will see this message and new bookings are halted.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Version Enforcement */}
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Minimum App Version Enforcement
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Prompt or block outdated mobile builds from connecting to backend APIs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rider App */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg space-y-3 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        Passenger / Rider App
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Force Update:</span>
                        <Switch
                          checked={generalForm.forceUpdateRiders}
                          onCheckedChange={(val) => setGeneralForm({ ...generalForm, forceUpdateRiders: val })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[11px] text-slate-500">Min Android Version</Label>
                        <Input
                          value={generalForm.riderMinVersionAndroid}
                          onChange={(e) => setGeneralForm({ ...generalForm, riderMinVersionAndroid: e.target.value })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Min iOS Version</Label>
                        <Input
                          value={generalForm.riderMinVersionIos}
                          onChange={(e) => setGeneralForm({ ...generalForm, riderMinVersionIos: e.target.value })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Driver App */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg space-y-3 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-emerald-500" />
                        Driver Partner App
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Force Update:</span>
                        <Switch
                          checked={generalForm.forceUpdateDrivers}
                          onCheckedChange={(val) => setGeneralForm({ ...generalForm, forceUpdateDrivers: val })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[11px] text-slate-500">Min Android Version</Label>
                        <Input
                          value={generalForm.driverMinVersionAndroid}
                          onChange={(e) => setGeneralForm({ ...generalForm, driverMinVersionAndroid: e.target.value })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-500">Min iOS Version</Label>
                        <Input
                          value={generalForm.driverMinVersionIos}
                          onChange={(e) => setGeneralForm({ ...generalForm, driverMinVersionIos: e.target.value })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6">
              <Save className="w-4 h-4 mr-2" />
              Save General & Version Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB: LOCATION & TELEMATICS SETTINGS (SolarWinds Architecture) */}
      {activeTab === 'location' && (
        <form onSubmit={handleSaveLocation} className="space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Primary Hub</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{locationForm.defaultCity}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{locationForm.defaultCenterLat.toFixed(2)}, {locationForm.defaultCenterLng.toFixed(2)}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">GPS Telematics Rate</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{locationForm.gpsUpdateIntervalSeconds}s Interval</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Live Driver Broadcast</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Radio className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Accuracy Filter</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{locationForm.locationAccuracyThresholdMeters}m Drift</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">High Precision Active</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Compass className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active Metro Hubs</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{locationForm.serviceableCities.length} Metros</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Geofenced Coverage</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Globe2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Base & Geolocation Center */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Primary Geolocation Hub & Default Map Center
                </CardTitle>
                <CardDescription className="text-xs">
                  Initial map center for passenger booking app when device GPS permission is initializing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Default Operational City Name</Label>
                  <Input
                    value={locationForm.defaultCity}
                    onChange={(e) => setLocationForm({ ...locationForm, defaultCity: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Center Latitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={locationForm.defaultCenterLat}
                      onChange={(e) => setLocationForm({ ...locationForm, defaultCenterLat: parseFloat(e.target.value) || 0 })}
                      className="h-9 font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Center Longitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={locationForm.defaultCenterLng}
                      onChange={(e) => setLocationForm({ ...locationForm, defaultCenterLng: parseFloat(e.target.value) || 0 })}
                      className="h-9 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* City Coordinate Fast Presets */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-slate-500">Quick City Coordinates Presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { city: 'Hyderabad', lat: 17.4435, lng: 78.3772 },
                      { city: 'Bangalore', lat: 12.9352, lng: 77.6245 },
                      { city: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
                      { city: 'Visakhapatnam', lat: 17.7126, lng: 83.3182 },
                      { city: 'Surat', lat: 21.1702, lng: 72.8311 },
                    ].map((p) => (
                      <button
                        key={p.city}
                        type="button"
                        onClick={() => handlePresetCity(p.city, p.lat, p.lng)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          locationForm.defaultCity.toLowerCase() === p.city.toLowerCase()
                            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        📍 {p.city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Max Nearby Driver Search Radius (km)</Label>
                    <span className="text-xs font-mono font-bold text-blue-600">{locationForm.maxNearbyDriverSearchRadiusKm} km</span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={locationForm.maxNearbyDriverSearchRadiusKm}
                    onChange={(e) => setLocationForm({ ...locationForm, maxNearbyDriverSearchRadiusKm: parseFloat(e.target.value) || 1 })}
                    className="h-2 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">Maximum distance to query active vehicle markers for the rider home map.</p>
                </div>
              </CardContent>
            </Card>

            {/* Telematics & Telemetry Frequency */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Live Driver Telematics & GPS Ping Rates
                </CardTitle>
                <CardDescription className="text-xs">
                  Controls how frequently driver mobile apps transmit live GPS waypoints over WebSockets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Driver GPS Broadcast Frequency (Seconds)</Label>
                    <Badge variant="outline" className="font-mono text-emerald-600 border-emerald-400">
                      Every {locationForm.gpsUpdateIntervalSeconds}s
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={locationForm.gpsUpdateIntervalSeconds}
                    onChange={(e) => setLocationForm({ ...locationForm, gpsUpdateIntervalSeconds: parseInt(e.target.value, 10) || 3 })}
                    className="h-9 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Lower interval yields smoother map movement, higher interval saves driver battery and socket bandwidth.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">GPS Accuracy Filter Threshold (Meters)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    value={locationForm.locationAccuracyThresholdMeters}
                    onChange={(e) => setLocationForm({ ...locationForm, locationAccuracyThresholdMeters: parseInt(e.target.value, 10) || 15 })}
                    className="h-9 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Discards inaccurate GPS fixes larger than this threshold to prevent driver vehicle jitter on maps.
                  </p>
                </div>

                <div className="space-y-3 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">High Accuracy Telematics Mode</p>
                      <p className="text-[11px] text-slate-400">Requests hardware GPS provider on Android and iOS devices</p>
                    </div>
                    <Switch
                      checked={locationForm.highAccuracyMode}
                      onCheckedChange={(checked) => setLocationForm({ ...locationForm, highAccuracyMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Active Geofence Boundary Check</p>
                      <p className="text-[11px] text-slate-400">Validates driver pickup & drop against polygon service zones</p>
                    </div>
                    <Switch
                      checked={locationForm.geofenceTrackingEnabled}
                      onCheckedChange={(checked) => setLocationForm({ ...locationForm, geofenceTrackingEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Reverse Geocoding Cache</p>
                      <p className="text-[11px] text-slate-400">Caches addresses locally to reduce external map API quota usage</p>
                    </div>
                    <Switch
                      checked={locationForm.enableReverseGeocodingCache}
                      onCheckedChange={(checked) => setLocationForm({ ...locationForm, enableReverseGeocodingCache: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Provider Engine */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Map Rendering Engine & API Providers
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose the mapping stack used for routing, polyline ETA calculation, and address lookup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Map Tile & Route Provider</Label>
                  <select
                    value={locationForm.mapProvider}
                    onChange={(e) => setLocationForm({ ...locationForm, mapProvider: e.target.value })}
                    className="w-full text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="osm">OpenStreetMap (OSM - Zero Cost Default)</option>
                    <option value="google">Google Maps Platform (Enterprise Distance Matrix)</option>
                    <option value="maplibre">MapLibre GL / Carto Tiles</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Google Maps API Key (Optional)</Label>
                  <Input
                    type="password"
                    placeholder="AIzaSy..."
                    value={locationForm.googleMapsApiKey}
                    onChange={(e) => setLocationForm({ ...locationForm, googleMapsApiKey: e.target.value })}
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Required only if selecting Google Maps for Places Autocomplete and Distance Matrix routing.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Serviceable Metro Cities */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Serviceable Metro Cities Coverage
                </CardTitle>
                <CardDescription className="text-xs">
                  Authorized metropolitan operational hubs where ride bookings and driver on-boarding are active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[64px]">
                  {locationForm.serviceableCities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No cities added yet.</p>
                  ) : (
                    locationForm.serviceableCities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs"
                      >
                        <MapPin className="h-3 w-3 text-purple-500" />
                        {city}
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(city)}
                          className="h-4 w-4 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter city name (e.g. Pune, Warangal)..."
                    value={newCityInput}
                    onChange={(e) => setNewCityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCity();
                      }
                    }}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCity}
                    variant="outline"
                    className="h-9 text-xs font-semibold px-4 flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add City
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              Save Location & Telematics Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: DISPATCH & TRIP RULES */}
      {activeTab === 'dispatch' && (
        <form onSubmit={handleSaveDispatch} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Dispatch Radius & Ride Acceptance Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Fine-tune the matching engine parameters that determine how drivers are notified and matched to passengers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Initial Driver Search Radius
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {dispatchForm.searchRadiusKm} km
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    max="15"
                    value={dispatchForm.searchRadiusKm}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, searchRadiusKm: parseFloat(e.target.value) || 1 })}
                    className="h-9"
                  />
                  <p className="text-[11px] text-slate-500">
                    Radius around passenger pickup point searched in Wave 1.
                  </p>
                </div>

                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Driver Acceptance Timeout
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {dispatchForm.driverTimeoutSeconds} sec
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    min="10"
                    max="60"
                    value={dispatchForm.driverTimeoutSeconds}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverTimeoutSeconds: parseInt(e.target.value) || 15 })}
                    className="h-9"
                  />
                  <p className="text-[11px] text-slate-500">
                    Seconds given to each driver before auto-offering to the next closest vehicle.
                  </p>
                </div>

                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Max Expanded Dispatch Radius
                    </Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {dispatchForm.maxDispatchDistanceKm} km
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    step="0.5"
                    min="2"
                    max="20"
                    value={dispatchForm.maxDispatchDistanceKm}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, maxDispatchDistanceKm: parseFloat(e.target.value) || 2 })}
                    className="h-9"
                  />
                  <p className="text-[11px] text-slate-500">
                    Maximum limit for outer search rings when initial radius yields no acceptances.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Cancellations & Safety Controls
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Rider Free Cancellation Window
                      </Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {dispatchForm.freeCancellationMinutes} min
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      max="15"
                      value={dispatchForm.freeCancellationMinutes}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, freeCancellationMinutes: parseInt(e.target.value) || 1 })}
                      className="h-9"
                    />
                    <p className="text-[11px] text-slate-500">
                      Minutes after driver acceptance where passenger can cancel without penalty.
                    </p>
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Cancellation Penalty Fee
                      </Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        ₹{dispatchForm.cancellationPenaltyFee}
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="5"
                      value={dispatchForm.cancellationPenaltyFee}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, cancellationPenaltyFee: parseInt(e.target.value) || 0 })}
                      className="h-9"
                    />
                    <p className="text-[11px] text-slate-500">
                      Fee credited to driver partner on late rider cancellation or passenger no-show.
                    </p>
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Max Driver Daily Driving Cap
                      </Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {dispatchForm.maxDriverDailyHours} hrs
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      min="6"
                      max="16"
                      value={dispatchForm.maxDriverDailyHours}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, maxDriverDailyHours: parseInt(e.target.value) || 8 })}
                      className="h-9"
                    />
                    <p className="text-[11px] text-slate-500">
                      Fatigue prevention cap: driver is forced offline after reaching this limit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mandatory 4-Digit Ride Start OTP
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Driver cannot start meter/trip without rider verbal PIN verification
                    </p>
                  </div>
                  <Switch
                    checked={dispatchForm.mandatoryRideOtp}
                    onCheckedChange={(val) => setDispatchForm({ ...dispatchForm, mandatoryRideOtp: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Auto-Offline on Consecutive Misses
                    </Label>
                    <p className="text-[11px] text-slate-500">
                      Protects acceptance scores if driver leaves phone unattended while marked online
                    </p>
                  </div>
                  <Switch
                    checked={dispatchForm.autoOfflineOnConsecutiveMisses}
                    onCheckedChange={(val) => setDispatchForm({ ...dispatchForm, autoOfflineOnConsecutiveMisses: val })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6">
              <Save className="w-4 h-4 mr-2" />
              Save Dispatch Parameters
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: DRIVER INACTIVITY & COMPLIANCE POLICY */}
      {activeTab === 'inactivity' && (
        <form onSubmit={handleSaveInactivity} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Automated Inactivity & Shift Suspension Engine
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Modeled after high-reliability mobility telematics: automatically manages drivers who fail to respond to dispatches.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Engine Active:</span>
                  <Switch
                    checked={inactivityForm.isEnabled}
                    onCheckedChange={(val) => setInactivityForm({ ...inactivityForm, isEnabled: val })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Thresholds */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Label className="text-xs font-semibold">Warning Threshold (Missed Pings)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={inactivityForm.warningMissedRides}
                    onChange={(e) => setInactivityForm({ ...inactivityForm, warningMissedRides: parseInt(e.target.value) || 1 })}
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-slate-500">Consecutive unaccepted dispatches before warning</p>
                </div>

                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Label className="text-xs font-semibold">Auto-Offline Cooldown (Minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={inactivityForm.cooldownMinutes}
                    onChange={(e) => setInactivityForm({ ...inactivityForm, cooldownMinutes: parseInt(e.target.value) || 5 })}
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-slate-500">Temporary timeout duration where driver is paused</p>
                </div>

                <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Label className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Shift Suspension Threshold
                  </Label>
                  <Input
                    type="number"
                    min="3"
                    max="20"
                    value={inactivityForm.suspensionThreshold}
                    onChange={(e) => setInactivityForm({ ...inactivityForm, suspensionThreshold: parseInt(e.target.value) || 5 })}
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-slate-500">Consecutive misses that suspend driver until manual re-verification</p>
                </div>
              </div>

              {/* Compliance Quality Floors */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Driver Fleet Performance Standards
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Label className="text-xs font-semibold">Minimum Acceptance Rate</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="50"
                        max="99"
                        value={inactivityForm.minAcceptanceRatePercent}
                        onChange={(e) => setInactivityForm({ ...inactivityForm, minAcceptanceRatePercent: parseInt(e.target.value) || 60 })}
                        className="h-9 font-mono"
                      />
                      <span className="text-xs text-slate-500 font-bold">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Target weekly ride acceptance floor</p>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Label className="text-xs font-semibold">Maximum Cancellation Ceiling</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="2"
                        max="25"
                        value={inactivityForm.maxCancellationRatePercent}
                        onChange={(e) => setInactivityForm({ ...inactivityForm, maxCancellationRatePercent: parseInt(e.target.value) || 5 })}
                        className="h-9 font-mono"
                      />
                      <span className="text-xs text-slate-500 font-bold">%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Allowed driver-initiated ride cancel cap</p>
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Label className="text-xs font-semibold">Minimum Rating Floor</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="3.0"
                        max="4.9"
                        value={inactivityForm.minDriverRatingThreshold}
                        onChange={(e) => setInactivityForm({ ...inactivityForm, minDriverRatingThreshold: parseFloat(e.target.value) || 4.0 })}
                        className="h-9 font-mono"
                      />
                      <span className="text-xs text-slate-500 font-bold">★</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Score below which driver enters quality probation</p>
                  </div>
                </div>
              </div>

              {/* Notification Templates */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customizable Push Notifications (Variables: {'{count}'}, {'{remaining}'})
                </h4>

                <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                      Level 1: Warning Push Title
                    </Label>
                    <Input
                      value={inactivityForm.warningTitle}
                      onChange={(e) => setInactivityForm({ ...inactivityForm, warningTitle: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                      Level 1: Warning Push Body
                    </Label>
                    <textarea
                      value={inactivityForm.warningMessage}
                      onChange={(e) => setInactivityForm({ ...inactivityForm, warningMessage: e.target.value })}
                      rows={2}
                      className="w-full text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-red-900 dark:text-red-200">
                      Level 2: Suspension Push Title
                    </Label>
                    <Input
                      value={inactivityForm.suspensionTitle}
                      onChange={(e) => setInactivityForm({ ...inactivityForm, suspensionTitle: e.target.value })}
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-red-900 dark:text-red-200">
                      Level 2: Suspension Push Body
                    </Label>
                    <textarea
                      value={inactivityForm.suspensionMessage}
                      onChange={(e) => setInactivityForm({ ...inactivityForm, suspensionMessage: e.target.value })}
                      rows={2}
                      className="w-full text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6">
              <Save className="w-4 h-4 mr-2" />
              Save Compliance Rules
            </Button>
          </div>
        </form>
      )}

      {/* TAB 5: APP BANNERS - Full Solar Hearts Implementation */}
      {activeTab === 'banners' && <BannersTab />}

      {/* TAB 6: INTRODUCTION IMAGES - Full Solar Hearts Implementation */}
      {activeTab === 'introimages' && (() => {
        const userIntroCount = introImages.filter((img) => (img.type || 'user') === 'user').length;
        const driverIntroCount = introImages.filter((img) => img.type === 'driver').length;
        const displayedIntroImages = introImages.filter((img) => {
          if (introFilterType === 'all') return true;
          return (img.type || 'user') === introFilterType || img.type === 'all';
        });

        return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-amber-500/10 rounded-2xl border border-blue-100 dark:border-blue-950/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Introduction Images
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {introImages.length} {introImages.length === 1 ? 'image' : 'images'} configured ({userIntroCount} User App, {driverIntroCount} Driver App). These display on mobile onboarding and login walkthroughs.
              </p>
            </div>
            <Button
              onClick={() => setIsIntroAddOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 w-full sm:w-auto shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Introduction Image
            </Button>
          </div>

          {/* App Category / Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setIntroFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                introFilterType === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All Screens
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${introFilterType === 'all' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                {introImages.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIntroFilterType('user')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                introFilterType === 'user'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              User App
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${introFilterType === 'user' ? 'bg-purple-800 text-white' : 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                {userIntroCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIntroFilterType('driver')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                introFilterType === 'driver'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              <Car className="h-3.5 w-3.5" />
              Driver App
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${introFilterType === 'driver' ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'}`}>
                {driverIntroCount}
              </span>
            </button>
          </div>

          {/* Intro Images Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-28">Priority</th>
                    <th className="py-3 px-4">Target App</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Image Preview</th>
                    <th className="py-3 px-4">Storage Path / Tag</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedIntroImages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No introduction images found for this category.</p>
                        <p className="text-xs text-slate-500 mt-1">Click "Add Introduction Image" to add an onboarding slide.</p>
                      </td>
                    </tr>
                  ) : (
                    displayedIntroImages.map((row, idx) => (
                      <tr key={row._id || row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveIntro(row._id || row.id, 'up')}
                              disabled={idx === 0}
                              className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs font-bold w-6 text-center text-slate-700 dark:text-slate-300">
                              {row.priority || (idx + 1)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveIntro(row._id || row.id, 'down')}
                              disabled={idx === displayedIntroImages.length - 1}
                              className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {row.type === 'driver' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-semibold gap-1 text-[11px]">
                              <Car className="h-3 w-3" /> Driver App
                            </Badge>
                          ) : row.type === 'all' ? (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-semibold gap-1 text-[11px]">
                              🌐 All Apps
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 font-semibold gap-1 text-[11px]">
                              <Smartphone className="h-3 w-3" /> User App
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {row.name || 'Unnamed Image'}
                          </div>
                          {row.tag && (
                            <div className="text-[11px] text-slate-400 font-medium">
                              {row.tag}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-14 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-sm">
                            <img
                              src={row.imageUrl}
                              alt={row.name || 'Intro'}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-slate-500 max-w-[220px] truncate block">
                            {row.imageUrl}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleIntroImage(row._id || row.id)}
                            className="focus:outline-none transition-transform hover:scale-105"
                          >
                            {row.isActive ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="h-3 w-3" /> Enabled
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[11px]">
                                Disabled
                              </Badge>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              onClick={() => handleEditIntroClick(row)}
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 h-8 w-8"
                              title="Edit Image"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setIntroToDelete(row);
                                setDeleteIntroConfirmOpen(true);
                              }}
                              variant="ghost"
                              size="icon"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8 w-8"
                              title="Delete Image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
      })()}

      {/* TAB 6: LEGAL & POLICIES */}
      {activeTab === 'policies' && (
        <form onSubmit={handleSavePolicies} className="space-y-6">
          {/* Target Application Selector - Same line as Intro Screens */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Application <span className="text-red-500 font-bold">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPolicyTargetApp('user')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  policyTargetApp === 'user'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Smartphone className="h-4 w-4 text-purple-600" />
                  User App
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Passenger Terms of Service, Privacy & Dispute Policies (godestuser)
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPolicyTargetApp('driver')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  policyTargetApp === 'driver'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Car className="h-4 w-4 text-emerald-600" />
                  Driver App
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Driver Partner Agreement, Telematics Privacy & Settlement Terms (godestdriver)
                </p>
              </button>
            </div>
          </div>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {policyTargetApp === 'driver' ? 'Driver Partner Legal & Operational Policies' : 'Passenger Legal Disclosures & Rider Policies'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {policyTargetApp === 'driver'
                      ? 'Synchronized in real-time with the Go Dest Driver App (godestdriver) compliance screen.'
                      : 'Synchronized in real-time with the Go Dest User App (godestuser) compliance screen.'}
                  </CardDescription>
                </div>
                <Badge className={policyTargetApp === 'driver' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold gap-1' : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 font-semibold gap-1'}>
                  {policyTargetApp === 'driver' ? <Car className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                  {policyTargetApp === 'driver' ? 'Driver App' : 'User App'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {policyTargetApp === 'driver'
                      ? 'Driver Partner Terms of Service & Code of Conduct'
                      : 'Passenger Master Terms of Service & Rider Agreement'}
                  </Label>
                  <Badge variant="outline" className="text-[10px]">
                    Markdown Supported
                  </Badge>
                </div>
                <textarea
                  value={policyTargetApp === 'driver' ? driverPoliciesForm.termsOfService : userPoliciesForm.termsOfService}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (policyTargetApp === 'driver') {
                      setDriverPoliciesForm((prev) => ({ ...prev, termsOfService: val }));
                    } else {
                      setUserPoliciesForm((prev) => ({ ...prev, termsOfService: val }));
                    }
                  }}
                  rows={8}
                  className="w-full text-xs font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {policyTargetApp === 'driver'
                      ? 'Driver Telematics & Background Location Privacy Policy'
                      : 'Passenger Privacy & Geolocation Telematics Policy'}
                  </Label>
                  <Badge variant="outline" className="text-[10px]">
                    Meets Google Play & Apple App Store Guidelines
                  </Badge>
                </div>
                <textarea
                  value={policyTargetApp === 'driver' ? driverPoliciesForm.privacyPolicy : userPoliciesForm.privacyPolicy}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (policyTargetApp === 'driver') {
                      setDriverPoliciesForm((prev) => ({ ...prev, privacyPolicy: val }));
                    } else {
                      setUserPoliciesForm((prev) => ({ ...prev, privacyPolicy: val }));
                    }
                  }}
                  rows={6}
                  className="w-full text-xs font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {policyTargetApp === 'driver'
                      ? 'Driver Fare Dispute, Toll & Settlement Reimbursement Policy'
                      : 'Passenger Fare Dispute & Refund Resolution Guidelines'}
                  </Label>
                  <Badge variant="outline" className="text-[10px]">
                    Support Center Reference
                  </Badge>
                </div>
                <textarea
                  value={policyTargetApp === 'driver' ? driverPoliciesForm.refundDisputePolicy : userPoliciesForm.refundDisputePolicy}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (policyTargetApp === 'driver') {
                      setDriverPoliciesForm((prev) => ({ ...prev, refundDisputePolicy: val }));
                    } else {
                      setUserPoliciesForm((prev) => ({ ...prev, refundDisputePolicy: val }));
                    }
                  }}
                  rows={6}
                  className="w-full text-xs font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6">
              <Save className="w-4 h-4 mr-2" />
              Save {policyTargetApp === 'driver' ? 'Driver Partner' : 'User'} Policies
            </Button>
          </div>
        </form>
      )}

      {/* MODAL: ADD INTRODUCTION IMAGE (Matching Solo Hearts) */}
      <Dialog open={isIntroAddOpen} onOpenChange={setIsIntroAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Smartphone className="h-5 w-5" />
              </div>
              Add Introduction Image
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload a mobile login grid introduction or onboarding walkthrough graphic file.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddIntroSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Target Application <span className="text-red-500 font-bold">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIntroForm({ ...introForm, type: 'user' })}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    (introForm.type || 'user') === 'user'
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    User App
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Passenger onboarding & walkthrough screens
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setIntroForm({ ...introForm, type: 'driver' })}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    introForm.type === 'driver'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Car className="h-4 w-4 text-emerald-600" />
                    Driver App
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Driver partner login & intro walkthrough
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Image Title / Name <span className="text-red-500 font-bold">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Instant City Cab Dispatch"
                value={introForm.name}
                onChange={(e) => setIntroForm({ ...introForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Step Tag / Description (Optional)
              </Label>
              <Input
                type="text"
                placeholder="e.g. Walkthrough Step 1"
                value={introForm.tag}
                onChange={(e) => setIntroForm({ ...introForm, tag: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Introduction Screen Graphic <span className="text-red-500 font-bold">*</span>
              </Label>
              <ImageDropzone
                value={introForm.imageBase64}
                onChange={({ file, previewUrl }) => {
                  setIntroForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imageBase64: previewUrl,
                  }));
                }}
                onClear={() => {
                  setIntroForm((prev) => ({
                    ...prev,
                    imageFile: null,
                    imageBase64: '',
                  }));
                }}
                aspectRatio="16/9"
                recommendedText="Drag & drop from machine or click to browse. PNG, JPG, WEBP"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsIntroAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Upload Image
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: EDIT INTRODUCTION IMAGE (Matching Solo Hearts) */}
      <Dialog open={isIntroEditOpen} onOpenChange={setIsIntroEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Pencil className="h-5 w-5" />
              </div>
              Edit Introduction Image
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update name, tag, or drag & drop a new graphic from your machine.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditIntroSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Target Application <span className="text-red-500 font-bold">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIntroEditForm({ ...introEditForm, type: 'user' })}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    (introEditForm.type || 'user') === 'user'
                      ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    User App
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Passenger onboarding & walkthrough screens
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setIntroEditForm({ ...introEditForm, type: 'driver' })}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    introEditForm.type === 'driver'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Car className="h-4 w-4 text-emerald-600" />
                    Driver App
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Driver partner login & intro walkthrough
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Image Title / Name <span className="text-red-500 font-bold">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Swift Bike & Auto Dispatch"
                value={introEditForm.name}
                onChange={(e) => setIntroEditForm({ ...introEditForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Step Tag / Description
              </Label>
              <Input
                type="text"
                placeholder="e.g. Walkthrough Step 1"
                value={introEditForm.tag}
                onChange={(e) => setIntroEditForm({ ...introEditForm, tag: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Screen Graphic Image
              </Label>
              <ImageDropzone
                value={introEditForm.imageBase64}
                onChange={({ file, previewUrl }) => {
                  setIntroEditForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imageBase64: previewUrl,
                  }));
                }}
                onClear={() => {
                  setIntroEditForm((prev) => ({
                    ...prev,
                    imageFile: null,
                    imageBase64: '',
                  }));
                }}
                aspectRatio="16/9"
                recommendedText="Drag & drop new file from machine to replace, or click to browse."
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsIntroEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DIALOG: DELETE INTRODUCTION IMAGE */}
      <ConfirmDialog
        open={deleteIntroConfirmOpen}
        onOpenChange={setDeleteIntroConfirmOpen}
        onConfirm={handleDeleteIntroConfirm}
        title="Delete Introduction Image?"
        description={`Are you sure you want to delete "${introToDelete?.name || 'this image'}"? It will no longer appear on user login onboarding.`}
        confirmText="Delete Image"
        variant="danger"
        icon={Trash2}
      />

      {/* MODAL: RESET DEFAULTS CONFIRMATION */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reset All Platform Settings?
            </DialogTitle>
            <DialogDescription className="text-xs">
              This will restore all feature toggles, dispatch radius, inactivity policies, and version thresholds to factory defaults.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleResetToDefaults}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

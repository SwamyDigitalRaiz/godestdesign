import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { useZoneStore } from '../../store/zoneStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useToast } from '../../components/ui/toaster';
import {
  MapPin,
  Trash2,
  ChevronRight,
  Maximize2,
  Minimize2,
  List,
  PenTool,
  Check,
  Globe2,
  Coins,
  RotateCcw,
  Sparkles,
  Car,
  Bike,
  CheckCircle2,
} from 'lucide-react';

const CITY_PRESETS = [
  { name: 'Surat (Default)', center: [21.1702, 72.8311], zoom: 13 },
  { name: 'Hyderabad', center: [17.4435, 78.3772], zoom: 12 },
  { name: 'Vijayawada', center: [16.5062, 80.648], zoom: 13 },
  { name: 'Bengaluru', center: [12.9716, 77.5946], zoom: 12 },
  { name: 'Mumbai', center: [19.076, 72.8777], zoom: 12 },
  { name: 'Delhi NCR', center: [28.6139, 77.209], zoom: 12 },
];

export function AddZonePage() {
  const { zones, addZone, updateZone } = useZoneStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [zoneName, setZoneName] = useState('');
  const [isActive, setIsActive] = useState('active');
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [coordinates, setCoordinates] = useState([]); // [[lat, lng], ...]
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vehiclePricings, setVehiclePricings] = useState([]);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const tempPolylineRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Load existing zone if in edit mode and populate vehicle rates
  useEffect(() => {
    if (vehicles.length === 0) return;

    if (editId) {
      const existing = zones.find((z) => z.id === editId || z._id === editId || z.customId === editId);
      if (existing) {
        setZoneName(existing.name || '');
        setIsActive(existing.status ? 'active' : 'inactive');
        setCoordinates(existing.coordinates || []);
        if (existing.center && mapInstanceRef.current) {
          mapInstanceRef.current.setView(existing.center, 13);
        }

        // Merge existing zone vehicle pricing with vehicle catalogue
        const existingPricings = existing.vehiclePricings || [];
        const merged = vehicles.map((v) => {
          const matched = existingPricings.find(
            (ep) =>
              String(ep.vehicleId) === String(v._id || v.id) ||
              String(ep.vehicleName).toLowerCase().trim() === String(v.name).toLowerCase().trim()
          );
          if (matched) {
            return {
              vehicleId: v._id || v.id,
              vehicleCustomId: v.customId || '',
              vehicleName: v.name,
              vehicleImage: v.image || '',
              minKmDistance: matched.minKmDistance ?? v.minKmDistance ?? 0,
              minKmPrice: matched.minKmPrice ?? v.minKmPrice ?? 0,
              afterKmPrice: matched.afterKmPrice ?? v.afterKmPrice ?? 0,
              extraCharge: matched.extraCharge ?? v.extraCharge ?? 0,
              commissionRate: matched.commissionRate ?? v.commissionRate ?? 10,
              commissionType: matched.commissionType || v.commissionType || '%',
              waitingChargePerMinute: matched.waitingChargePerMinute ?? v.waitingChargePerMinute ?? 2,
              freeWaitingMinutes: matched.freeWaitingMinutes ?? v.freeWaitingMinutes ?? 5,
              isEnabled: matched.isEnabled !== false,
              isModified: true,
            };
          }
          return {
            vehicleId: v._id || v.id,
            vehicleCustomId: v.customId || '',
            vehicleName: v.name,
            vehicleImage: v.image || '',
            minKmDistance: v.minKmDistance ?? 0,
            minKmPrice: v.minKmPrice ?? 0,
            afterKmPrice: v.afterKmPrice ?? 0,
            extraCharge: v.extraCharge ?? 0,
            commissionRate: v.commissionRate ?? 10,
            commissionType: v.commissionType || '%',
            waitingChargePerMinute: v.waitingChargePerMinute ?? 2,
            freeWaitingMinutes: v.freeWaitingMinutes ?? 5,
            isEnabled: true,
            isModified: false,
          };
        });
        setVehiclePricings(merged);
        return;
      }
    }

    // Creating new zone: populate with vehicle defaults
    setVehiclePricings((prev) => {
      if (prev.length > 0) return prev;
      return vehicles.map((v) => ({
        vehicleId: v._id || v.id,
        vehicleCustomId: v.customId || '',
        vehicleName: v.name,
        vehicleImage: v.image || '',
        minKmDistance: v.minKmDistance ?? 0,
        minKmPrice: v.minKmPrice ?? 0,
        afterKmPrice: v.afterKmPrice ?? 0,
        extraCharge: v.extraCharge ?? 0,
        commissionRate: v.commissionRate ?? 10,
        commissionType: v.commissionType || '%',
        waitingChargePerMinute: v.waitingChargePerMinute ?? 2,
        freeWaitingMinutes: v.freeWaitingMinutes ?? 5,
        isEnabled: true,
        isModified: false,
      }));
    });
  }, [editId, zones, vehicles]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: selectedCity.center,
      zoom: selectedCity.zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl =
      mapType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const baseTile = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = baseTile;
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Click handler to plot polygon vertices
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setCoordinates((prev) => [...prev, [Number(lat.toFixed(6)), Number(lng.toFixed(6))]]);
    });

    // Invalidate size after layout renders
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map / Satellite Toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newUrl =
      mapType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTile = L.tileLayer(newUrl, {
      attribution:
        mapType === 'satellite' ? '&copy; Esri & OpenStreetMap' : '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [mapType]);

  // Handle City Change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(city.center, city.zoom);
    }
  };

  // Redraw Polygon when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    if (polygonLayerRef.current) {
      mapInstanceRef.current.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    if (tempPolylineRef.current) {
      mapInstanceRef.current.removeLayer(tempPolylineRef.current);
      tempPolylineRef.current = null;
    }

    if (coordinates.length === 0) return;

    // Plot vertex markers
    coordinates.forEach((coord, index) => {
      const isFirst = index === 0;
      const marker = L.circleMarker(coord, {
        radius: isFirst ? 7 : 5,
        fillColor: isFirst ? '#2563EB' : '#FFFFFF',
        color: '#2563EB',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      });

      marker.bindTooltip(`Point #${index + 1}${isFirst ? ' (Start)' : ''}`, {
        direction: 'top',
        offset: [0, -5],
      });

      markersGroupRef.current.addLayer(marker);
    });

    if (coordinates.length >= 3) {
      const polygon = L.polygon(coordinates, {
        color: '#2563EB',
        weight: 2.5,
        opacity: 0.9,
        fillColor: '#3B82F6',
        fillOpacity: 0.25,
      }).addTo(mapInstanceRef.current);

      polygonLayerRef.current = polygon;
    } else if (coordinates.length > 1) {
      const polyline = L.polyline(coordinates, {
        color: '#2563EB',
        weight: 2,
        dashArray: '5, 8',
      }).addTo(mapInstanceRef.current);

      tempPolylineRef.current = polyline;
    }
  }, [coordinates]);

  // Calculate approximate polygon area in km²
  const calculateArea = (coords) => {
    if (!coords || coords.length < 3) return 0;
    let area = 0;
    const R = 6378137;
    const rad = Math.PI / 180;
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const x1 = p1[1] * rad * R * Math.cos(p1[0] * rad);
      const y1 = p1[0] * rad * R;
      const x2 = p2[1] * rad * R * Math.cos(p2[0] * rad);
      const y2 = p2[0] * rad * R;
      area += x1 * y2 - x2 * y1;
    }
    const areaSqM = Math.abs(area / 2);
    return Number((areaSqM / 1_000_000).toFixed(2));
  };

  const handleDeleteSelectedArea = () => {
    setCoordinates([]);
    toast({
      title: 'Area Cleared',
      description: 'The selected boundary has been deleted. Click on map to plot new points.',
    });
  };

  const handlePricingChange = (vehicleId, field, value) => {
    setVehiclePricings((prev) =>
      prev.map((item) => {
        if (item.vehicleId === vehicleId) {
          return {
            ...item,
            [field]: value,
            isModified: true,
          };
        }
        return item;
      })
    );
  };

  const handleResetToDefault = (vehicleId) => {
    const defaultVehicle = vehicles.find((v) => (v._id || v.id) === vehicleId);
    if (!defaultVehicle) return;

    setVehiclePricings((prev) =>
      prev.map((item) => {
        if (item.vehicleId === vehicleId) {
          return {
            ...item,
            minKmDistance: defaultVehicle.minKmDistance ?? 0,
            minKmPrice: defaultVehicle.minKmPrice ?? 0,
            afterKmPrice: defaultVehicle.afterKmPrice ?? 0,
            extraCharge: defaultVehicle.extraCharge ?? 0,
            commissionRate: defaultVehicle.commissionRate ?? 10,
            commissionType: defaultVehicle.commissionType || '%',
            waitingChargePerMinute: defaultVehicle.waitingChargePerMinute ?? 2,
            freeWaitingMinutes: defaultVehicle.freeWaitingMinutes ?? 5,
            isEnabled: true,
            isModified: false,
          };
        }
        return item;
      })
    );

    toast({
      title: 'Reset to Vehicle Default',
      description: `Prices for ${defaultVehicle.name} have been restored to default vehicle catalog rates.`,
    });
  };

  const handleResetAllToDefault = () => {
    setVehiclePricings(
      vehicles.map((v) => ({
        vehicleId: v._id || v.id,
        vehicleCustomId: v.customId || '',
        vehicleName: v.name,
        vehicleImage: v.image || '',
        minKmDistance: v.minKmDistance ?? 0,
        minKmPrice: v.minKmPrice ?? 0,
        afterKmPrice: v.afterKmPrice ?? 0,
        extraCharge: v.extraCharge ?? 0,
        commissionRate: v.commissionRate ?? 10,
        commissionType: v.commissionType || '%',
        waitingChargePerMinute: v.waitingChargePerMinute ?? 2,
        freeWaitingMinutes: v.freeWaitingMinutes ?? 5,
        isEnabled: true,
        isModified: false,
      }))
    );
    toast({
      title: 'All Rates Reset',
      description: 'All vehicle pricing rules have been reset to global vehicle catalog defaults.',
    });
  };

  const calculateSampleFare = (p, distanceKm = 5.0) => {
    const baseKm = Number(p.minKmDistance) || 0;
    const baseFare = Number(p.minKmPrice) || 0;
    const perKm = Number(p.afterKmPrice) || 0;
    const extra = Number(p.extraCharge) || 0;
    let fare = baseFare;
    if (distanceKm > baseKm) {
      fare += (distanceKm - baseKm) * perKm;
    }
    fare += extra;
    return Math.round(fare);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!zoneName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for the zone.',
        variant: 'destructive',
      });
      return;
    }

    if (coordinates.length < 3) {
      toast({
        title: 'Incomplete Boundary',
        description: 'Please plot at least 3 points on the map to define the zone boundary.',
        variant: 'destructive',
      });
      return;
    }

    const calculatedArea = calculateArea(coordinates);
    const centerLat = coordinates.reduce((sum, p) => sum + p[0], 0) / coordinates.length;
    const centerLng = coordinates.reduce((sum, p) => sum + p[1], 0) / coordinates.length;

    const zonePayload = {
      name: zoneName.trim(),
      status: isActive === 'active',
      city: selectedCity.name.replace(' (Default)', ''),
      coordinates,
      center: [Number(centerLat.toFixed(6)), Number(centerLng.toFixed(6))],
      areaSqKm: calculatedArea,
      vehiclePricings: vehiclePricings.map((p) => ({
        vehicleId: p.vehicleId,
        vehicleCustomId: p.vehicleCustomId,
        vehicleName: p.vehicleName,
        vehicleImage: p.vehicleImage,
        minKmDistance: Number(p.minKmDistance) || 0,
        minKmPrice: Number(p.minKmPrice) || 0,
        afterKmPrice: Number(p.afterKmPrice) || 0,
        extraCharge: Number(p.extraCharge) || 0,
        commissionRate: Number(p.commissionRate) || 10,
        commissionType: p.commissionType || '%',
        waitingChargePerMinute: Number(p.waitingChargePerMinute) || 2,
        freeWaitingMinutes: Number(p.freeWaitingMinutes) || 5,
        isEnabled: p.isEnabled !== false,
      })),
    };

    if (editId) {
      await updateZone(editId, zonePayload);
      toast({
        title: 'Zone Updated',
        description: `Zone "${zoneName}" with custom vehicle rates has been successfully updated.`,
      });
    } else {
      const res = await addZone(zonePayload);
      if (res && res.success === false) {
        toast({
          title: 'Failed to Create Zone',
          description: res.message || 'Error occurred while saving zone.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Zone Created',
        description: `Zone "${zoneName}" with ${coordinates.length} boundary points and vehicle rates saved successfully.`,
      });
    }

    navigate('/zone/list');
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header & Breadcrumb ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/zone/list" className="hover:text-primary transition-colors">
              Zone
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">
              {editId ? 'Edit Zone' : 'Add Zone'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {editId ? 'Edit Zone' : 'Add Zone'}
          </h1>
        </div>

        {/* Top-Right "Zone List" Button */}
        <div>
          <Link to="/zone/list">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-all">
              <List className="h-4 w-4" />
              Zone List
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Add Zone Form Card ────────────────────────────────────────── */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Top Form Fields: Name & Is Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg h-10 px-3.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Is Active
              </label>
              <div className="relative">
                <select
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg h-10 px-3.5 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* City Preset Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Jump to City:</span>
              <div className="flex flex-wrap gap-1">
                {CITY_PRESETS.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleCityChange(city)}
                    className={`px-2.5 py-0.5 rounded-full border text-xs font-medium transition-colors ${
                      selectedCity.name === city.name
                        ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {coordinates.length} points plotted
              </span>
              {coordinates.length >= 3 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[11px]">
                  ~{calculateArea(coordinates)} km²
                </Badge>
              )}
            </div>
          </div>

          {/* Interactive Leaflet Map Box */}
          <div
            className={`relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner ${
              isFullscreen
                ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-none'
                : 'h-[500px] w-full'
            }`}
          >
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="h-full w-full bg-slate-100 dark:bg-slate-950 z-0" />

            {/* Top-Left: Map / Satellite & Tools */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <div className="flex bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-medium text-slate-700 dark:text-slate-200">
                <button
                  type="button"
                  onClick={() => setMapType('roadmap')}
                  className={`px-3 py-1.5 transition-colors ${
                    mapType === 'roadmap'
                      ? 'font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Map
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 ${
                    mapType === 'satellite'
                      ? 'font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Satellite
                </button>
              </div>

              <div className="flex items-center bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  type="button"
                  title="Click map to place polygon vertices"
                  className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 transition-colors"
                >
                  <PenTool className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Clear Boundary"
                  onClick={handleDeleteSelectedArea}
                  className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 border-l border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Top-Right: Fullscreen Toggle */}
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
                className="bg-white dark:bg-slate-800 p-2 rounded-md shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>

            {/* Helpful Helper Text Overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm px-3.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm text-xs text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>
                {coordinates.length === 0
                  ? 'Click anywhere on the map to start plotting polygon boundaries'
                  : coordinates.length < 3
                  ? `Plotted ${coordinates.length} point(s) — click at least 3 points to enclose a zone`
                  : `Zone polygon enclosed (${coordinates.length} points) — click again to add more vertices`}
              </span>
            </div>

            {/* Floating "Delete Selected Area" button */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
              <button
                type="button"
                onClick={handleDeleteSelectedArea}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected Area
              </button>
            </div>
          </div>

          {/* ── Zone Vehicle Pricing Matrix ────────────────────────────── */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Zone Vehicle Pricing Matrix</span>
                    <Badge variant="outline" className="bg-amber-50/70 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] font-medium">
                      Auto-sync from Vehicles
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Default prices from vehicle catalog are pre-filled below. You can customize per-km rates, base fares, and fees specifically for this zone.
                  </p>
                </div>
              </div>

              {vehiclePricings.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetAllToDefault}
                  className="text-xs h-8 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All to Defaults
                </Button>
              )}
            </div>

            {vehiclePricings.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                <Car className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Loading vehicle rates...
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vehicle rates from the Vehicle Setup section will automatically load here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {vehiclePricings.map((pricing) => {
                  const defaultVeh = vehicles.find((v) => (v._id || v.id) === pricing.vehicleId);
                  const isModifiedFromDefault = defaultVeh && (
                    Number(pricing.minKmDistance) !== Number(defaultVeh.minKmDistance ?? 0) ||
                    Number(pricing.minKmPrice) !== Number(defaultVeh.minKmPrice ?? 0) ||
                    Number(pricing.afterKmPrice) !== Number(defaultVeh.afterKmPrice ?? 0) ||
                    Number(pricing.extraCharge) !== Number(defaultVeh.extraCharge ?? 0) ||
                    Number(pricing.commissionRate) !== Number(defaultVeh.commissionRate ?? 10)
                  );

                  const sample5KmFare = calculateSampleFare(pricing, 5.0);
                  const sample15KmFare = calculateSampleFare(pricing, 15.0);

                  return (
                    <div
                      key={pricing.vehicleId || pricing.vehicleName}
                      className={`p-4 rounded-xl border transition-all ${
                        pricing.isEnabled
                          ? isModifiedFromDefault
                            ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40 shadow-sm'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-sm'
                          : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      {/* Vehicle Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                            {pricing.vehicleImage ? (
                              <img
                                src={pricing.vehicleImage}
                                alt={pricing.vehicleName}
                                className="h-full w-full object-contain p-1"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : pricing.vehicleName.toLowerCase().includes('bike') || pricing.vehicleName.toLowerCase().includes('scooty') ? (
                              <Bike className="h-6 w-6 text-slate-500" />
                            ) : (
                              <Car className="h-6 w-6 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {pricing.vehicleName}
                              </h4>
                              {isModifiedFromDefault ? (
                                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 text-[10px] font-medium py-0 px-1.5">
                                  Custom Zone Rate
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] py-0 px-1.5">
                                  Default Rate
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              ID: {pricing.vehicleCustomId || pricing.vehicleId} • Live simulation: 5 km = <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{sample5KmFare}</span> | 15 km = <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{sample15KmFare}</span>
                            </p>
                          </div>
                        </div>

                        {/* Enable switch & Reset button */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {isModifiedFromDefault && (
                            <button
                              type="button"
                              onClick={() => handleResetToDefault(pricing.vehicleId)}
                              title="Reset back to global vehicle default rates"
                              className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Reset to Default</span>
                            </button>
                          )}

                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {pricing.isEnabled ? 'Active in Zone' : 'Disabled in Zone'}
                            </span>
                            <Switch
                              checked={pricing.isEnabled}
                              onCheckedChange={(val) => handlePricingChange(pricing.vehicleId, 'isEnabled', val)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Inputs Grid */}
                      {pricing.isEnabled && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
                          {/* Base Distance (KM) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span>Base Distance</span>
                              <span className="text-[10px] text-slate-400 font-mono">KM</span>
                            </label>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              value={pricing.minKmDistance}
                              onChange={(e) => handlePricingChange(pricing.vehicleId, 'minKmDistance', e.target.value)}
                              className="h-8 text-xs bg-white dark:bg-slate-900"
                              placeholder="0"
                            />
                            <p className="text-[10px] text-slate-400">Default: {defaultVeh?.minKmDistance ?? 0} km</p>
                          </div>

                          {/* Base Fare (₹) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span>Base Fare</span>
                              <span className="text-[10px] text-slate-400 font-mono">₹</span>
                            </label>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              value={pricing.minKmPrice}
                              onChange={(e) => handlePricingChange(pricing.vehicleId, 'minKmPrice', e.target.value)}
                              className="h-8 text-xs bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200"
                              placeholder="0"
                            />
                            <p className="text-[10px] text-slate-400">Default: ₹{defaultVeh?.minKmPrice ?? 0}</p>
                          </div>

                          {/* Per KM Rate (₹/KM) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span>Per KM Rate</span>
                              <span className="text-[10px] text-slate-400 font-mono">₹/km</span>
                            </label>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              value={pricing.afterKmPrice}
                              onChange={(e) => handlePricingChange(pricing.vehicleId, 'afterKmPrice', e.target.value)}
                              className="h-8 text-xs bg-white dark:bg-slate-900 font-semibold text-blue-600 dark:text-blue-400"
                              placeholder="0"
                            />
                            <p className="text-[10px] text-slate-400">Default: ₹{defaultVeh?.afterKmPrice ?? 0}/km</p>
                          </div>

                          {/* Extra / Booking Fee (₹) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span>Extra / Fee</span>
                              <span className="text-[10px] text-slate-400 font-mono">₹</span>
                            </label>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              value={pricing.extraCharge}
                              onChange={(e) => handlePricingChange(pricing.vehicleId, 'extraCharge', e.target.value)}
                              className="h-8 text-xs bg-white dark:bg-slate-900"
                              placeholder="0"
                            />
                            <p className="text-[10px] text-slate-400">Default: ₹{defaultVeh?.extraCharge ?? 0}</p>
                          </div>

                          {/* Commission Rate (%) */}
                          <div className="space-y-1 col-span-2 sm:col-span-1">
                            <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span>Commission</span>
                              <span className="text-[10px] text-slate-400 font-mono">%</span>
                            </label>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={pricing.commissionRate}
                              onChange={(e) => handlePricingChange(pricing.vehicleId, 'commissionRate', e.target.value)}
                              className="h-8 text-xs bg-white dark:bg-slate-900"
                              placeholder="10"
                            />
                            <p className="text-[10px] text-slate-400">Default: {defaultVeh?.commissionRate ?? 10}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 h-11 rounded-lg shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              {editId ? 'Update Zone' : 'Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

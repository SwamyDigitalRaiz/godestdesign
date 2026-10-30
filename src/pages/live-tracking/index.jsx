import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useDriverStore } from '../../store/driverStore';
import L from 'leaflet';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Car,
  Bike,
  Zap,
  Radio,
  Play,
  Pause,
  Maximize2,
  RefreshCw,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  User,
  Compass,
  Building2,
  Eye,
  Crosshair,
  TrendingUp,
  BatteryCharging,
  Gauge,
  X,
} from 'lucide-react';

// Preset City Hubs & Zones in Hyderabad / Cyberabad
const CITY_ZONES = [
  { id: 'all', name: 'All Hyderabad Metros', coords: [17.4400, 78.3800], zoom: 12 },
  { id: 'cyberabad', name: 'Cyberabad / Hitec City', coords: [17.4470, 78.3760], zoom: 14 },
  { id: 'gachibowli', name: 'Gachibowli Financial District', coords: [17.4320, 78.3450], zoom: 14 },
  { id: 'kukatpally', name: 'Kukatpally & Miyapur', coords: [17.4910, 78.4005], zoom: 14 },
  { id: 'secunderabad', name: 'Secunderabad & Begumpet', coords: [17.4420, 78.4980], zoom: 14 },
  { id: 'banjara', name: 'Banjara & Jubilee Hills', coords: [17.4200, 78.4350], zoom: 14 },
];

// Initial Live Tracked Fleet Data
const INITIAL_VEHICLES = [];

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

export function LiveTrackingPage() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);

  const { drivers, fetchDrivers } = useDriverStore();
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchDrivers({ limit: 100 });
  }, [fetchDrivers]);

  useEffect(() => {
    if (drivers && drivers.length > 0) {
      const activeFromDb = drivers
        .filter((d) => d.liveLocation && Array.isArray(d.liveLocation.coordinates) && d.liveLocation.coordinates.length === 2)
        .map((d) => ({
          id: d.customId || d.id || `DRV-${d._id?.toString().slice(-4) || '000'}`,
          name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Driver',
          phone: d.primaryPhone || d.phone || '',
          avatar: d.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          vehicleType: d.vehicleType || 'Auto',
          vehicleNumber: d.vehicleNumber || '—',
          vendor: d.vendor || 'Direct Partner',
          coords: [d.liveLocation.coordinates[1], d.liveLocation.coordinates[0]],
          speed: d.liveLocation.speed || 0,
          heading: d.liveLocation.heading || 0,
          status: d.dutyStatus === 'online' ? 'available' : 'idle',
          battery: 85,
          rating: d.rating || 5.0,
          activeTrip: null,
        }));
      setVehicles(activeFromDb);
      if (activeFromDb.length > 0) {
        setSelectedVehicle(activeFromDb[0]);
      } else {
        setSelectedVehicle(null);
      }
    } else {
      setVehicles([]);
      setSelectedVehicle(null);
    }
  }, [drivers]);
  const [activeZone, setActiveZone] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'on_trip' | 'available' | 'auto' | 'bike'
  const [search, setSearch] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [mapLayer, setMapLayer] = useState('streets'); // 'streets' | 'dark' | 'satellite'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [17.4470, 78.3760],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrls = {
      streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    };

    L.tileLayer(tileUrls[mapLayer] || tileUrls.streets, {
      attribution: '&copy; OpenStreetMap contributors &copy; Go Dest Live',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLayer]);

  // Update & Draw Markers whenever vehicles or map changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    vehicles.forEach((veh) => {
      const isSelected = selectedVehicle?.id === veh.id;
      const isAuto = veh.vehicleType.toLowerCase().includes('auto');
      const isTrip = veh.status === 'on_trip';
      const isAvail = veh.status === 'available';

      // Pin Color Palette
      const pinColor = isTrip ? '#F59E0B' : isAvail ? '#10B981' : '#64748B';
      const pulseHtml = isTrip ? `<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>` : '';

      const markerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
          <div style="
            background: ${isSelected ? '#0F172A' : '#FFFFFF'};
            color: ${isSelected ? '#FBBF24' : '#0F172A'};
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid ${pinColor};
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>${isAuto ? '🛺' : '🏍️'}</span>
            <span>${veh.name.split(' ')[0]}</span>
            <span style="font-size: 9px; opacity: 0.8; font-family: monospace;">${veh.speed}km/h</span>
            ${pulseHtml}
          </div>
          <div style="
            width: 14px;
            height: 14px;
            background: ${pinColor};
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            margin-top: 2px;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        className: `custom-driver-marker-${veh.id}`,
        html: markerHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker(veh.coords, { icon }).addTo(map);

      marker.on('click', () => {
        handleSelectVehicle(veh);
      });

      markersRef.current[veh.id] = marker;
    });
  }, [vehicles, selectedVehicle]);

  // Route Polyline when a vehicle on a trip is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }
    if (dropMarkerRef.current) {
      dropMarkerRef.current.remove();
      dropMarkerRef.current = null;
    }

    if (selectedVehicle?.status === 'on_trip' && selectedVehicle.activeTrip) {
      const { pickupCoords, dropCoords, routeCoordinates } = selectedVehicle.activeTrip;
      const driverCoords = selectedVehicle.coords;

      const pathCoords = Array.isArray(routeCoordinates) && routeCoordinates.length > 2
        ? routeCoordinates
        : generateCurvedRoadSpline(pickupCoords, dropCoords, 28);

      const polyline = L.polyline(pathCoords, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      polylineRef.current = polyline;

      // Pickup Marker
      const pickupIcon = L.divIcon({
        className: 'pickup-flag',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
            <div style="background: #10B981; color: white; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              🟢 Pickup
            </div>
            <div style="width: 10px; height: 10px; background: #10B981; border: 2px solid white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [0, 0],
      });
      pickupMarkerRef.current = L.marker(pickupCoords, { icon: pickupIcon }).addTo(map);

      // Dropoff Marker
      const dropIcon = L.divIcon({
        className: 'drop-flag',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
            <div style="background: #EF4444; color: white; padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              🔴 Dropoff
            </div>
            <div style="width: 10px; height: 10px; background: #EF4444; border: 2px solid white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [0, 0],
      });
      dropMarkerRef.current = L.marker(dropCoords, { icon: dropIcon }).addTo(map);
    }
  }, [selectedVehicle]);

  // Subtle Live Simulation: Nudge moving vehicles every 3 seconds
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== 'on_trip' && v.status !== 'available') return v;

          // Tiny delta jitter along heading
          const jitterLat = (Math.random() - 0.48) * 0.0006;
          const jitterLng = (Math.random() - 0.48) * 0.0006;
          const speedDelta = Math.floor((Math.random() - 0.5) * 4);
          const newSpeed = Math.max(15, Math.min(65, v.speed + speedDelta));

          return {
            ...v,
            coords: [v.coords[0] + jitterLat, v.coords[1] + jitterLng],
            speed: newSpeed,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleSelectVehicle = (veh) => {
    setSelectedVehicle(veh);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(veh.coords, 15, { duration: 1.2 });
    }
  };

  const handleZoneChange = (zoneId) => {
    setActiveZone(zoneId);
    const zone = CITY_ZONES.find((z) => z.id === zoneId);
    if (zone && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(zone.coords, zone.zoom, { duration: 1.5 });
    }
  };

  // Filter Vehicles
  const filteredVehicles = vehicles.filter((v) => {
    if (filterType === 'on_trip' && v.status !== 'on_trip') return false;
    if (filterType === 'available' && v.status !== 'available') return false;
    if (filterType === 'auto' && !v.vehicleType.toLowerCase().includes('auto')) return false;
    if (filterType === 'bike' && !v.vehicleType.toLowerCase().includes('bike')) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchPlate = v.vehicleNumber.toLowerCase().includes(q);
      const matchVendor = v.vendor.toLowerCase().includes(q);
      const matchTrip = v.activeTrip?.tripId?.toLowerCase().includes(q);
      if (!matchName && !matchPlate && !matchVendor && !matchTrip) return false;
    }
    return true;
  });

  const tripCount = vehicles.filter((v) => v.status === 'on_trip').length;
  const availCount = vehicles.filter((v) => v.status === 'available').length;
  const idleCount = vehicles.filter((v) => v.status === 'idle').length;

  return (
    <div className="relative h-[calc(100vh-4.5rem)] w-full overflow-hidden flex flex-col bg-slate-950 font-sans">
      {/* ── TOP CONTROL & KPI HUD BAR ─────────────────────────────────── */}
      <div className="z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Live Fleet Radar
              <span className="text-xs font-normal text-slate-500">({vehicles.length} Active Vehicles)</span>
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              {tripCount} On Active Trips
            </Badge>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              {availCount} Available
            </Badge>
          </div>
        </div>

        {/* Center: City Zone Quick Jump */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden md:inline">Zone:</span>
          {CITY_ZONES.map((z) => (
            <button
              key={z.id}
              onClick={() => handleZoneChange(z.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all whitespace-nowrap ${
                activeZone === z.id
                  ? 'bg-primary text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {z.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Right: Map Actions */}
        <div className="flex items-center gap-2">
          {/* Map Layer Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2 py-1 rounded ${mapLayer === 'streets' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Standard
            </button>
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2 py-1 rounded ${mapLayer === 'dark' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Voyager
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-1 rounded ${mapLayer === 'satellite' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
              Satellite
            </button>
          </div>

          {/* Live Feed Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`text-xs flex items-center gap-1.5 ${isLiveStreaming ? 'text-emerald-600 border-emerald-500/40' : 'text-amber-500 border-amber-500/40'}`}
          >
            {isLiveStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isLiveStreaming ? 'Streaming' : 'Paused'}
          </Button>

          {/* Toggle Sidebar */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-xs"
          >
            {sidebarOpen ? 'Hide Fleet List' : 'Show Fleet List'}
          </Button>
        </div>
      </div>

      {/* ── MAP CONTAINER & OVERLAYS ─────────────────────────────────── */}
      <div className="relative flex-1 w-full h-full">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

        {/* ── COMMAND CENTER SIDEBAR (OVERLAY ON MAP) ─────────────────── */}
        {sidebarOpen && (
          <div className="absolute top-3 left-3 z-10 w-80 md:w-96 max-h-[calc(100%-1.5rem)] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all animate-fade-in">
            {/* Header & Search */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search driver, plate, trip ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                {[
                  { id: 'all', label: `All (${vehicles.length})` },
                  { id: 'on_trip', label: `On Trip (${tripCount})` },
                  { id: 'available', label: `Available (${availCount})` },
                  { id: 'auto', label: 'Autos' },
                  { id: 'bike', label: 'Bikes' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium transition-colors ${
                      filterType === f.id
                        ? 'bg-primary text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drivers List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[60vh] scrollbar-thin">
              {filteredVehicles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No vehicles match your active search filters.
                </div>
              ) : (
                filteredVehicles.map((veh) => {
                  const isSelected = selectedVehicle?.id === veh.id;
                  const isAuto = veh.vehicleType.toLowerCase().includes('auto');
                  const isOnTrip = veh.status === 'on_trip';

                  return (
                    <div
                      key={veh.id}
                      onClick={() => handleSelectVehicle(veh)}
                      className={`p-3 cursor-pointer transition-all flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={veh.avatar}
                          alt={veh.name}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                              {veh.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {isAuto ? '🛺' : '🏍️'}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500 font-medium">
                            {veh.vehicleNumber}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {veh.vendor}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge
                          variant={isOnTrip ? 'warning' : veh.status === 'available' ? 'success' : 'outline'}
                          className="text-[10px] font-semibold capitalize"
                        >
                          {isOnTrip ? 'On Trip' : veh.status}
                        </Badge>
                        <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">
                          <Gauge className="h-3 w-3 text-slate-400" />
                          <span>{veh.speed} km/h</span>
                        </div>
                        {isOnTrip && veh.activeTrip && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                            ETA: {veh.activeTrip.eta}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVE TRIP INSPECTOR CARD (BOTTOM RIGHT HUD) ─────────────── */}
        {selectedVehicle && (
          <div className="absolute bottom-4 right-4 z-10 w-96 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  {selectedVehicle.vehicleType.includes('Auto') ? '🛺' : '🏍️'}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {selectedVehicle.name} • {selectedVehicle.vehicleNumber}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {selectedVehicle.vendor}
                  </p>
                </div>
              </div>
              <Badge
                variant={selectedVehicle.status === 'on_trip' ? 'warning' : 'success'}
                className="text-[10px] capitalize font-bold"
              >
                {selectedVehicle.status === 'on_trip' ? 'Live on Trip' : 'Available'}
              </Badge>
            </div>

            {/* Telemetry Strip */}
            <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100/70 dark:bg-slate-950/40 text-center border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Speed</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedVehicle.speed} km/h</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Battery</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedVehicle.battery}%</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Rating</span>
                <span className="font-bold text-amber-500">★ {selectedVehicle.rating}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">GPS</span>
                <span className="font-bold text-emerald-500">Online</span>
              </div>
            </div>

            {/* Trip Details (If on Trip) */}
            {selectedVehicle.status === 'on_trip' && selectedVehicle.activeTrip ? (
              <div className="p-3.5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    Booking: {selectedVehicle.activeTrip.tripId}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    ETA: {selectedVehicle.activeTrip.eta} ({selectedVehicle.activeTrip.distanceLeft} left)
                  </span>
                </div>

                {/* Rider Info */}
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">
                        {selectedVehicle.activeTrip.customerName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {selectedVehicle.activeTrip.customerPhone}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 text-xs">
                    {selectedVehicle.activeTrip.fare} ({selectedVehicle.activeTrip.paymentMethod})
                  </span>
                </div>

                {/* Route Points */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 line-clamp-1">
                      {selectedVehicle.activeTrip.pickup}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 line-clamp-1">
                      {selectedVehicle.activeTrip.drop}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> SOS: Normal (0 Alerts)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2.5"
                    onClick={() => handleSelectVehicle(selectedVehicle)}
                  >
                    <Crosshair className="h-3 w-3 mr-1" />
                    Center Map
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Vehicle Available for Dispatch
                </p>
                <p className="text-[11px] text-slate-400">
                  Currently idling in zone {selectedVehicle.vendor}. Ready to receive booking offers.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useZoneStore } from '../../store/zoneStore';
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

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const tempPolylineRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Load existing zone if in edit mode
  useEffect(() => {
    if (editId) {
      const existing = zones.find((z) => z.id === editId);
      if (existing) {
        setZoneName(existing.name || '');
        setIsActive(existing.status ? 'active' : 'inactive');
        setCoordinates(existing.coordinates || []);
        if (existing.center && mapInstanceRef.current) {
          mapInstanceRef.current.setView(existing.center, 13);
        }
      }
    }
  }, [editId, zones]);

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
    };

    if (editId) {
      await updateZone(editId, zonePayload);
      toast({
        title: 'Zone Updated',
        description: `Zone "${zoneName}" has been successfully updated.`,
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
        description: `Zone "${zoneName}" with ${coordinates.length} boundary points saved successfully.`,
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

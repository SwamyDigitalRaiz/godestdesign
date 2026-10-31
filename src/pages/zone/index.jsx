import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Edit2,
  Eye,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  ChevronRight,
  Layers,
  X,
  Globe2,
  Coins,
  Bike,
  Car,
} from 'lucide-react';

export function ZoneListPage() {
  const { zones, loading, fetchZones, deleteZone, toggleZoneStatus } = useZoneStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewZone, setPreviewZone] = useState(null);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Preview Modal Map ref
  const previewMapContainerRef = useRef(null);
  const previewMapInstanceRef = useRef(null);

  // Filter zones
  const filteredZones = zones.filter((z) => {
    const matchSearch =
      (z.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (z.city && z.city.toLowerCase().includes(search.toLowerCase())) ||
      (z.id || '').toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && z.status) ||
      (statusFilter === 'inactive' && !z.status);

    return matchSearch && matchStatus;
  });

  const handleDeleteZone = async (id, name) => {
    if (confirm(`Are you sure you want to delete zone "${name}"?`)) {
      await deleteZone(id);
      toast({
        title: 'Zone Removed',
        description: `Zone "${name}" has been deleted.`,
      });
      if (previewZone?.id === id || previewZone?._id === id) {
        setPreviewZone(null);
      }
    }
  };

  // Preview Map effect
  useEffect(() => {
    if (!previewZone || !previewMapContainerRef.current) return;

    if (previewMapInstanceRef.current) {
      previewMapInstanceRef.current.remove();
      previewMapInstanceRef.current = null;
    }

    const map = L.map(previewMapContainerRef.current, {
      center: previewZone.center || [21.1702, 72.8311],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    if (previewZone.coordinates && previewZone.coordinates.length >= 3) {
      const polygon = L.polygon(previewZone.coordinates, {
        color: '#2563EB',
        weight: 3,
        fillColor: '#3B82F6',
        fillOpacity: 0.35,
      }).addTo(map);

      map.fitBounds(polygon.getBounds(), { padding: [25, 25] });
    }

    previewMapInstanceRef.current = map;

    return () => {
      if (previewMapInstanceRef.current) {
        previewMapInstanceRef.current.remove();
        previewMapInstanceRef.current = null;
      }
    };
  }, [previewZone]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* ── Page Header & Breadcrumbs ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-medium">Zone List</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Zone List
            <Badge variant="outline" className="text-xs font-normal border-blue-200 text-blue-600 bg-blue-50/50">
              {zones.length} Total
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage operational geo-fenced boundaries, active zones, and city coverage.
          </p>
        </div>

        {/* Top-Right "+ Add Zone" Button */}
        <div>
          <Link to="/zone/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-all">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Zones</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{zones.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Zones</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {zones.filter((z) => z.status).length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inactive Zones</p>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 mt-1">
                {zones.filter((z) => !z.status).length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Coverage Area</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {zones.reduce((sum, z) => sum + (z.areaSqKm || 0), 0).toFixed(1)} km²
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search ────────────────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by zone name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                {['all', 'active', 'inactive'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <Link to="/zone/add">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 h-9"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Zone</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Zones Table ─────────────────────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Zone Name</th>
                <th className="py-3 px-4">City / Region</th>
                <th className="py-3 px-4">Boundary Points</th>
                <th className="py-3 px-4">Coverage Area</th>
                <th className="py-3 px-4">Vehicle Rates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredZones.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <MapPin className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      No zones found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your filters or click "+ Add Zone" to create a new boundary.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredZones.map((zone, idx) => (
                  <tr
                    key={zone.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {zone.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {zone.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {zone.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {zone.city || 'Surat'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs font-normal border-slate-200 dark:border-slate-700">
                        {zone.coordinates ? zone.coordinates.length : 0} Vertices
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {zone.areaSqKm ? `${zone.areaSqKm} km²` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {zone.vehiclePricings && zone.vehiclePricings.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5 text-amber-500" />
                            {zone.vehiclePricings.filter((v) => v.isEnabled !== false).length} Vehicles
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Custom Zone Matrix
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Global Vehicle Rates
                        </span>
                      )}
                    </td>
                     <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleZoneStatus(zone._id || zone.id);
                          toast({
                            title: 'Zone Status Changed',
                            description: `${zone.name} is now ${!zone.status ? 'Active' : 'Inactive'}.`,
                          });
                        }}
                        className="group flex items-center gap-1.5 focus:outline-none"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            zone.status ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            zone.status
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {zone.status ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewZone(zone)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="View Zone Boundary on Map"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/zone/add?edit=${zone._id || zone.id}`)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit Zone Boundary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteZone(zone._id || zone.id, zone.name)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Delete Zone"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Preview Modal: View Zone Boundary on Map ── */}
      {previewZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {previewZone.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewZone.city} • {previewZone.areaSqKm} km² coverage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewZone(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div
                ref={previewMapContainerRef}
                className="h-80 w-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner bg-slate-100"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Vertices: {previewZone.coordinates?.length || 0} geo-points</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Status: {previewZone.status ? 'Active' : 'Inactive'}
                </span>
              </div>

              {previewZone.vehiclePricings && previewZone.vehiclePricings.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      Zone Vehicle Rates
                    </span>
                    <Badge variant="outline" className="text-[10px] text-slate-500">
                      {previewZone.vehiclePricings.filter((v) => v.isEnabled !== false).length} Active Vehicles
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {previewZone.vehiclePricings.map((vp) => (
                      <div
                        key={vp.vehicleId || vp.vehicleName}
                        className={`p-2 rounded-lg border text-xs ${
                          vp.isEnabled !== false
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 opacity-50'
                        }`}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {vp.vehicleName}
                        </p>
                        <div className="mt-1 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <p>Base: ₹{vp.minKmPrice} ({vp.minKmDistance} km)</p>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">+₹{vp.afterKmPrice}/km</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewZone(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const z = previewZone;
                  setPreviewZone(null);
                  navigate(`/zone/add?edit=${z.id}`);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit in Map Editor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
